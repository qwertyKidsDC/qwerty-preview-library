#!/usr/bin/env python3
"""Read-only guard for the shared Qwerty Labs site styles and page components.

Run from anywhere: python3 website/qwertylabs/_tools/check_style_contract.py
No external packages, browser, build step or network connection required.
"""
from pathlib import Path
import re
import sys

SITE = Path(__file__).resolve().parents[1]
STYLES = ("style.css", "mobile.css")
VALID_BRANDS = {"lab", "kids", "adults", "teens"}
errors = []


def issue(page, message):
    errors.append(f"{page}: {message}")


def find_html_pages():
    # The older enrolment-preview.html is a standalone design experiment;
    # shared pages declare their layout explicitly.
    return {
        p.relative_to(SITE).as_posix(): p.read_text(encoding="utf-8")
        for p in sorted(SITE.rglob("*.html"))
        if re.search(r'data-layout="(?:site|subpage)"', p.read_text(encoding="utf-8"))
    }


def nav_links(html):
    match = re.search(r'<nav class="navigation"[^>]*>.*?</nav>', html, re.S)
    if not match:
        return None
    return re.findall(r'<a\b[^>]*\bhref="([^"]+)"', match.group())


def footer_links(html):
    match = re.search(
        r'<section class="small-cards footer-nav-cards"[^>]*>.*?</main>',
        html, re.S
    )
    return re.findall(r'<a\b[^>]*\bhref="([^"]+)"', match.group()) if match else None


def duplicate_selectors(css):
    """Report repeated selector blocks in the SAME media/supports context."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    stack = []
    start = 0
    found = set()
    repeated = []
    for i, character in enumerate(css):
        if character == "{":
            stack.append((css[start:i].strip(), i + 1))
            start = i + 1
        elif character == "}":
            if not stack:
                return ["unbalanced closing brace"]
            selector, _ = stack.pop()
            if selector and not selector.startswith("@"):
                context = tuple(item[0] for item in stack if item[0].startswith("@"))
                key = (context, selector)
                if key in found:
                    repeated.append(f"{context}: {selector}")
                found.add(key)
            start = i + 1
    if stack:
        repeated.append("unclosed CSS block")
    return repeated


def main():
    pages = find_html_pages()
    if "index.html" not in pages or "kids.html" not in pages:
        issue("site", "homepage and canonical Kids template must exist")
        return 1

    standard_nav = nav_links(pages["kids.html"])
    standard_footer = footer_links(pages["kids.html"])
    for filename, html in pages.items():
        brand = re.search(r'data-brand="([^"]+)"', html)
        layout = re.search(r'data-layout="([^"]+)"', html)
        if not brand or brand.group(1) not in VALID_BRANDS:
            issue(filename, "invalid or missing data-brand")
        if not layout or layout.group(1) != ("site" if filename == "index.html" else "subpage"):
            issue(filename, "wrong data-layout")
        if re.search(r"<style\b|\sstyle\s*=", html, re.I):
            issue(filename, "inline CSS is forbidden on shared pages")

        urls = re.findall(r'href="((?:style|mobile)\.css(?:\?[^"]*)?)"', html)
        if urls != list(STYLES):
            issue(filename, "must load style.css then mobile.css, exactly once, without version queries")

        if nav_links(html) != standard_nav:
            issue(filename, "main navigation differs from Kids template")
        if html.count('class="navigation-group') != 4:
            issue(filename, "expected four shared navigation groups")

        cards = footer_links(html)
        if cards is not None and cards != standard_footer:
            issue(filename, "footer cards differ from Kids template")

        ids = re.findall(r'\bid="([^"]+)"', html)
        if len(ids) != len(set(ids)):
            issue(filename, "duplicate HTML ids")
        missing = [ref for refs in re.findall(r'\baria-labelledby="([^"]+)"', html)
                   for ref in refs.split() if ref not in ids]
        if missing:
            issue(filename, f"broken aria-labelledby references: {missing}")
        for image in re.findall(r"<img\b[^>]*>", html, re.I):
            if not re.search(r'\balt=["\x27]', image):
                issue(filename, "image lacks an alt attribute")
        for tag in re.findall(r"<a\b[^>]*>", html, re.I):
            if 'aria-current="page"' in tag:
                match = re.search(r'\bhref="([^"]+)"', tag)
                if not match or match.group(1).split("#")[0] != filename:
                    issue(filename, "aria-current=page points to another page")

    for name in STYLES:
        css = (SITE / name).read_text(encoding="utf-8")
        for problem in duplicate_selectors(css):
            issue(name, f"duplicate CSS selector: {problem}")
        if "!important" in css:
            issue(name, "remove !important rather than overpowering shared rules")
        # Hex colours are not selectors; any other #name is a page-specific ID.
        uncommented = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        without_urls = re.sub(r"url\([^)]*\)", "", uncommented, flags=re.I)
        ids = [token for token in re.findall(r"#([A-Za-z][\w-]*)", without_urls)
               if not re.fullmatch(r"[0-9A-Fa-f]{3,8}", token)]
        if ids:
            issue(name, f"page-specific CSS ID selectors: {sorted(set(ids))}")
    mobile = (SITE / "mobile.css").read_text(encoding="utf-8")
    if len(re.findall(r"@media\s*\(max-width:\s*760px\)", mobile)) != 1:
        issue("mobile.css", "use one consolidated 760px media block")

    if errors:
        print("Style contract FAILED")
        for item in errors:
            print(" -", item)
        return 1
    print(f"Style contract passed: {len(pages)} shared pages, two CSS files, "
          "clean URLs, consistent navigation and footer cards.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
