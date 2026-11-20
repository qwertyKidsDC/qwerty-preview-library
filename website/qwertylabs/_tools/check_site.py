#!/usr/bin/env python3
"""Qwerty Labs quality gate. Read-only checks against the actual site.

Run from repository root:
  python website/qwertylabs/_tools/check_site.py --static-only
  python website/qwertylabs/_tools/check_site.py
Requires: beautifulsoup4, tinycss2, playwright; axe-core for WCAG tests.
"""
from __future__ import annotations

import argparse
from collections import Counter
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import subprocess
import sys
import threading
from urllib.parse import unquote, urlsplit

from bs4 import BeautifulSoup
import tinycss2
from PIL import Image

COMPLETE = (
    "index.html", "kids.html", "tools.html", "a-kids-pov.html",
    "kids-coding-classes.html", "coding-camp.html",
    "child-safety.html", "privacy.html", "booking-terms.html",
)
DRAFTS = ("adults.html", "teens.html", "thelab.html")
PAGES = COMPLETE + DRAFTS
HERO = {
    "index.html": "qwerty-labs-mascots-led-electronics.webp", "kids.html": "qwerty-labs-mascots-robot-car.webp",
    "tools.html": "qwerty-labs-mascots-cardboard-rocket.webp", "a-kids-pov.html": "qwerty-labs-mascots-cardboard-rocket.webp",
    "kids-coding-classes.html": "qwerty-labs-mascots-robot-car.webp",
    "coding-camp.html": "qwerty-labs-mascots-robot-car.webp",
    "child-safety.html": "qwerty-labs-mascots-cardboard-rocket.webp",
    "privacy.html": "qwerty-labs-mascots-cardboard-rocket.webp",
    "booking-terms.html": "qwerty-labs-mascots-cardboard-rocket.webp",
}
VIEWPORTS = (("desktop", 1440, 900), ("mobile", 390, 844))


def record(report, code, detail, blocking=True):
    report["failures" if blocking else "review"].append(
        {"code": code, "detail": detail}
    )


def check_sources(root, report):
    css_files = ("style.css", "mobile.css")
    css = "\n".join((root / name).read_text(encoding="utf-8") for name in css_files)
    cache_versions = {}
    for name in PAGES:
        file = root / name
        if not file.is_file():
            record(report, "page_missing", name)
            continue
        document = BeautifulSoup(file.read_text(encoding="utf-8"), "html.parser")
        if not document.html or document.html.get("lang") != "en-AU":
            record(report, "language", name)
        if name in COMPLETE:
            sheets = [
                urlsplit(link.get("href", "")).path
                for link in document.select('link[rel="stylesheet"]')
                if not link.get("href", "").startswith(("https:", "http:", "//"))
            ]
            if sheets != list(css_files):
                record(report, "css_files", f"{name}: {sheets}")
            cache_versions[name] = tuple(
                link.get("href", "") for link in document.select('link[rel="stylesheet"]')
                if urlsplit(link.get("href", "")).path in css_files
            )
            want_layout = "site" if name == "index.html" else "subpage"
            if document.html.get("data-layout") != want_layout:
                record(report, "layout", name)
            if document.select("[style],style"):
                record(report, "inline_css", name)
            hero = document.select_one(".hero img.mascots")
            expected = "img/" + HERO[name]
            if not hero or any(
                hero.get(k) != v for k, v in
                (("src", expected), ("width", "1240"), ("height", "955"))
            ):
                record(report, "hero_asset_contract", f"{name}: {expected}")
            if any(len(document.select(t)) != 1 for t in ("header", "main", "footer", "h1")):
                record(report, "landmarks", name)
        ids = [node.get("id") for node in document.select("[id]")]
        duplicate = [k for k, v in Counter(ids).items() if v > 1]
        if duplicate:
            record(report, "duplicate_ids", f"{name}: {duplicate}")
        for node in document.select("[aria-labelledby],[aria-describedby]"):
            for attr in ("aria-labelledby", "aria-describedby"):
                for token in node.get(attr, "").split():
                    if token not in ids:
                        record(report, "aria_target", f"{name}: {token}")
        for img in document.select("img"):
            if not img.has_attr("alt"):
                record(report, "image_alt", f"{name}: {img.get('src')}")
        for node in document.select("[src],[href],[poster]"):
            for attr in ("src", "href", "poster"):
                value = node.get(attr)
                if not value or value.startswith(
                    ("https:", "http:", "//", "mailto:", "tel:", "data:", "javascript:")
                ):
                    continue
                u = urlsplit(value)
                if not u.path:
                    if u.fragment and u.fragment not in ids:
                        record(report, "local_anchor", f"{name}: {value}")
                    continue
                target = (root / unquote(u.path)).resolve()
                if not target.is_relative_to(root.resolve()):
                    record(report, "asset_escape", f"{name}: {value}")
                elif not target.is_file():
                    record(report, "missing_asset", f"{name}: {value}")
        for button in document.select("button"):
            if not button.get_text(strip=True) and not button.get("aria-label"):
                record(report, "button_name", f"{name}: unnamed button")

    if len(set(cache_versions.values())) != 1:
        record(report, "cache_version", cache_versions)
    report["css_version"] = list(next(iter(cache_versions.values()), ()))
    # Check the image bytes, not just the width/height attributes in HTML.
    for filename in sorted(set(HERO.values())):
        with Image.open(root / "img" / filename) as asset:
            if asset.size != (1240, 955) or "A" not in asset.getbands():
                record(report, "hero_dimensions_or_alpha",
                       f"{filename}: {asset.size}, {asset.mode}")
    selectors = []
    invalid = []

    def walk(nodes, scope=()):
        for node in nodes:
            if node.type == "error":
                invalid.append(str(node))
            elif node.type == "at-rule" and node.content is not None:
                if node.at_keyword in ("font-face", "page", "property"):
                    declarations = tinycss2.parse_declaration_list(
                        node.content, skip_whitespace=True, skip_comments=True
                    )
                    invalid.extend(str(x) for x in declarations if x.type == "error")
                else:
                    media_scope = scope + ((node.at_keyword, tinycss2.serialize(node.prelude).strip()),)
                    walk(tinycss2.parse_rule_list(
                        node.content, skip_whitespace=True, skip_comments=True
                    ), media_scope)
            elif node.type == "qualified-rule":
                selector = tinycss2.serialize(node.prelude).strip()
                selectors.append((scope, selector))
                declarations = tinycss2.parse_declaration_list(
                    node.content, skip_whitespace=True, skip_comments=True
                )
                invalid.extend(f"{selector}: {x}" for x in declarations if x.type == "error")

    walk(tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True))
    if invalid:
        record(report, "css_syntax", invalid[:15])
    repeated = [
        {"scope": list(scope), "selector": selector, "count": n}
        for (scope, selector), n in Counter(selectors).items() if n > 1
    ]
    report["css"] = {"rules": len(selectors), "repeated_selectors": repeated}
    if repeated:
        record(report, "css_repeat_review", repeated, blocking=False)
    # Match component classes against real HTML and script-added states.
    html_classes = set()
    for name in PAGES:
        if (root / name).is_file():
            doc = BeautifulSoup((root / name).read_text(encoding="utf-8"), "html.parser")
            for node in doc.select("[class]"):
                html_classes.update(node.get("class", []))
    script_sources = (root / "script.js").read_text(encoding="utf-8") + (root / "brand.js").read_text(encoding="utf-8")
    css_classes = set()
    for scope, selector in selectors:
        css_classes.update(re.findall(r"\.([a-zA-Z_][\w-]*)", selector))
    unused_classes = sorted(c for c in css_classes if c not in html_classes and c not in script_sources)
    report["css"]["unused_classes"] = unused_classes
    if unused_classes:
        record(report, "unused_css_classes", unused_classes)
    for name in ("brand.js", "script.js"):
        result = subprocess.run(
            ["node", "--check", str(root / name)], capture_output=True, text=True
        )
        if result.returncode:
            record(report, "javascript_syntax", f"{name}: {result.stderr}")
    # Inventory only; assets are not deleted simply because current pages
    # don't reference them. Some are intentionally held in the asset catalogue.
    combined = "\n".join((root / name).read_text(encoding="utf-8")
                         for name in PAGES if (root / name).is_file())
    combined += css + (root / "script.js").read_text(encoding="utf-8")
    image_files = [p for p in (root / "img").rglob("*") if p.is_file()]
    report["asset_inventory"] = {
        "total": len(image_files),
        "not_directly_used": [
            p.relative_to(root).as_posix() for p in image_files
            if p.relative_to(root).as_posix() not in combined
            and p.name not in combined
        ],
    }


@contextmanager
def serve(root):
    class Quiet(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)
        def log_message(self, *args): pass
    server = ThreadingHTTPServer(("127.0.0.1", 0), Quiet)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        thread.join(timeout=5)


def browser_checks(root, output, report):
    from playwright.sync_api import sync_playwright
    axe = root.parents[1] / "node_modules" / "axe-core" / "axe.min.js"
    if not axe.is_file():
        record(report, "axe_not_installed", "axe-core missing: cannot verify WCAG")
    measurements = []
    with serve(root) as origin, sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for name in PAGES:
            for mode, width, height in VIEWPORTS:
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    reduced_motion="reduce",
                )
                page = context.new_page()
                page_errors = []
                page.on("pageerror", lambda err: page_errors.append(str(err)))
                page.goto(f"{origin}/{name}", wait_until="load")
                page.evaluate("document.fonts.ready")
                # Off-screen images are intentionally lazy-loaded. Trigger their
                # download before classifying a file as broken.
                page.evaluate("""async () => {
                    const imgs = [...document.images];
                    imgs.forEach(img => { img.loading = 'eager'; });
                    await Promise.all(imgs.map(img => img.decode().catch(() => {})));
                }""")
                invalid_images = page.evaluate("""() => [...document.images]
                    .filter(img => img.naturalWidth === 0)
                    .map(img => img.getAttribute('src'))""")
                if invalid_images:
                    record(report, "image_load", f"{name} {mode}: {invalid_images}")
                if page_errors:
                    record(report, "script_runtime", f"{name} {mode}: {page_errors}")
                overflow = page.evaluate(
                    "document.documentElement.scrollWidth - document.documentElement.clientWidth"
                )
                if overflow > 4:
                    record(report, "horizontal_overflow", f"{name} {mode}: {overflow}px",
                           blocking=False)
                if mode == "desktop":
                    evidence = page.evaluate("""() => {
                        const img = document.querySelector('.mascots');
                        const next = document.querySelector('.hero + section');
                        if (!img || !next) return null;
                        const a=img.getBoundingClientRect();
                        const b=next.getBoundingClientRect();
                        return {heroImageBottom:a.bottom, nextSectionTop:b.top,
                                offset:b.top-a.bottom};
                    }""")
                    measurements.append({"page": name, "hero": evidence})
                screenshot = output / "screenshots" / f"{name[:-5]}-{mode}.jpg"
                screenshot.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(screenshot), type="jpeg", quality=84, full_page=True, animations="disabled")
                if axe.is_file():
                    page.add_script_tag(path=str(axe))
                    violations = page.evaluate("""async () => {
                        const r = await axe.run(document, {runOnly: {type: 'tag',
                            values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
                        return r.violations.map(v=>({
                            id:v.id, impact:v.impact,
                            targets:v.nodes.slice(0,8).map(n=>n.target)}));
                    }""")
                    for v in violations:
                        blocking = v["impact"] in ("serious", "critical")
                        record(report, "axe_" + v["id"],
                               f"{name} {mode} ({v['impact']}): {v['targets']}",
                               blocking=blocking)
                # A real keyboard press, not .focus(), triggers :focus-visible.
                page.keyboard.press("Tab")
                keyboard = page.evaluate("""() => {
                    const el = document.activeElement;
                    const css = getComputedStyle(el);
                    return {skip:el.classList.contains('skip'),
                            outline:css.outlineStyle};
                }""")
                if not keyboard["skip"] or keyboard["outline"] == "none":
                    record(report, "keyboard_skip_link",
                           f"{name} {mode}: {keyboard}")
                if mode == "mobile":
                    menu = page.locator(".mobile-menu-toggle")
                    if menu.count() != 1:
                        record(report, "mobile_menu_missing", name)
                    else:
                        menu.click()
                        if menu.get_attribute("aria-expanded") != "true":
                            record(report, "mobile_menu_open", name)
                        subnav = page.locator(".navigation-group .navigation-toggle").first
                        subnav.click()
                        if subnav.get_attribute("aria-expanded") != "true":
                            record(report, "mobile_submenu_open", name)
                        page.keyboard.press("Escape")
                        if subnav.get_attribute("aria-expanded") != "false":
                            record(report, "mobile_submenu_escape", name)
                        page.keyboard.press("Escape")
                        if menu.get_attribute("aria-expanded") != "false":
                            record(report, "mobile_menu_escape", name)
                context.close()
        browser.close()
    report["browser"] = {"views": len(PAGES)*len(VIEWPORTS),
                         "hero_measurements": measurements}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--out", type=Path, default=Path("site-quality-report"))
    parser.add_argument("--static-only", action="store_true")
    args = parser.parse_args()
    report = {"pages": list(PAGES), "failures": [], "review": []}
    check_sources(args.root.resolve(), report)
    if not args.static_only:
        browser_checks(args.root.resolve(), args.out, report)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print("Qwerty Labs quality gate:",
          len(report["failures"]), "failures,",
          len(report["review"]), "review items")
    for item in report["failures"][:40]:
        print("FAIL", item["code"], item["detail"])
    for item in report["review"][:15]:
        print("REVIEW", item["code"], str(item["detail"])[:250])
    return 1 if report["failures"] else 0


if __name__ == "__main__":
    sys.exit(main())
