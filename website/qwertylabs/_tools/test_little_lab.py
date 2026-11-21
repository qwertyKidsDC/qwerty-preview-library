#!/usr/bin/env python3
"""Browser smoke test for the isolated Little Lab enrolment prototype.

Runs against a local static server. Only imaginary information is entered.
A preview cannot submit, persist, book or charge.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright


@contextmanager
def serve(root: Path):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)

        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}/form-little-lab.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def check(cond, message):
    if not cond:
        raise AssertionError(message)


def desktop(browser, url, output):
    context = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = context.new_page()
    submissions = []
    page.on("request", lambda request: submissions.append(request.url) if request.method == "POST" else None)
    response = page.goto(url, wait_until="domcontentloaded")
    check(response and response.status == 200, "Prototype must load")
    check(page.locator("html").get_attribute("data-brand") == "kids", "Must use Kids theme")
    check(page.locator(".subpage-board.qll-lab").count() == 1, "Must use the existing editorial board")
    check(page.locator("img[src*='mascot-ready/q-individual-r05-c01.webp']").count() == 1, "Original unframed Q missing")
    check(page.locator(".qlf-step:not([hidden])").get_attribute("data-step") == "0", "Starts on programme step")
    check(page.locator(".qll-side__paper").count() == 1, "Exactly one paper note")
    check(page.locator(".qll-side__mascot").evaluate("(img) => img.complete && img.naturalWidth > 0"), "Original Q asset must render")
    check(page.locator(".qll-side__frame, .qll-side__power").count() == 0, "No old framed mascot or circuit strip")
    check(page.locator("[data-lab-speech]").inner_text() == "Ooh, someone’s about to enrol.", "Stage one dialogue")
    # Approved palette must be used in the rendered UI (not white inputs or off-brand heading text).
    palette = page.evaluate("""() => {
        const style = selector => getComputedStyle(document.querySelector(selector));
        return {
            paper: style('.qll-side__paper').backgroundColor,
            speech: style('.qll-side__saying').color,
            paperHeading: style('.qll-side__eyebrow').color,
            input: style('#family-type').backgroundColor,
            inputText: style('#family-type').color,
        };
    }""")
    check(palette == {
        "paper": "rgb(247, 244, 235)",
        "speech": "rgb(2, 0, 32)",
        "paperHeading": "rgb(2, 0, 32)",
        "input": "rgb(247, 244, 235)",
        "inputText": "rgb(2, 0, 32)",
    }, f"Speech and inputs must use approved ivory/ink palette: {palette}")

    page.locator("#family-type").select_option("new")
    page.locator("#term").select_option("2027-t1")
    page.locator("#preferred-class").select_option("sat9")
    page.locator("#qlf-next").click()
    page.locator("#child-0-first").fill("Frankie")
    check("It’s Frankie! Yay, a new maker to meet." in page.locator("[data-lab-speech]").inner_text(), "Child-focused greeting")
    page.locator("#qlf-add-child").click()
    check("Frankie! Who else is joining?" in page.locator("[data-lab-speech]").inner_text(), "Prompt for additional child")
    page.locator("#child-1-first").fill("Maya")
    check("Frankie and Maya! Double yay, two new makers to meet." in page.locator("[data-lab-speech]").inner_text(), "Both children's names in greeting")
    page.locator("#child-1-last").fill("Example")
    page.locator("#child-1-age").select_option("11")
    page.locator("#child-1-experience").select_option("some")
    page.locator("#child-1-session").select_option("sat9")
    page.locator("#child-1-photo").select_option("no")
    page.locator("#child-0-last").fill("Example")
    page.locator("#child-0-age").select_option("9")
    page.locator("#child-0-experience").select_option("new")
    page.locator("#child-0-session").select_option("sat9")
    page.locator("#child-0-photo").select_option("no")
    page.locator("#qlf-next").click()
    check("Excitement! Frankie and Maya are on the way." in page.locator("[data-lab-speech]").inner_text(), "Both names carry through")
    page.locator("#parent-first").fill("Alex")
    page.locator("#parent-last").fill("Example")
    page.locator("#parent-email").fill("alex@example.invalid")
    page.locator("#parent-phone").fill("0400000000")
    page.locator("#emergency-name").fill("Casey Example")
    page.locator("#emergency-phone").fill("0411000000")
    page.locator("#departure").select_option("no")
    page.locator("#emergency-consent").check()
    page.locator("#terms-consent").check()
    page.locator("#qlf-next").click()
    check(page.locator("[data-lab-speech]").inner_text() == "Almost there!", "Stage four dialogue")
    page.locator("#qlf-next").click()
    check("Looking good from here!" in page.locator("[data-lab-speech]").inner_text(), "Playful final line")
    check("Nothing has been sent" in page.locator(".qlf-done").inner_text(), "Completion must say no data sent")
    check(not submissions, f"Prototype must never send POST requests: {submissions}")
    page.locator(".qll-lab").screenshot(path=str(output / "little-lab-desktop.png"), animations="disabled")
    # Returning families get distinct dialogue; children may be new to Qwerty.
    page.reload(wait_until="domcontentloaded")
    page.locator("#family-type").select_option("returning")
    check(page.locator("[data-lab-speech]").inner_text() == "Ooh, a familiar family! Welcome back.", "Returning family's stage one")
    page.locator("#term").select_option("2027-t1")
    page.locator("#preferred-class").select_option("sat9")
    page.locator("#qlf-next").click()
    check(page.locator("[data-lab-speech]").inner_text() == "Who’s making things with us this time?", "Returning family without child name")
    page.locator("#child-0-first").fill("Frankie")
    check(page.locator("[data-lab-speech]").inner_text() == "It’s Frankie! Yay, lovely to see your family again.", "One child, returning family")
    page.locator("#qlf-add-child").click()
    page.locator("#child-1-first").fill("Maya")
    check(page.locator("[data-lab-speech]").inner_text() == "Frankie and Maya! Double yay, lovely to see your family again.", "Two children, returning family")
    page.locator("#qlf-add-child").click()
    page.locator("#child-2-first").fill("Luca")
    check(page.locator("[data-lab-speech]").inner_text() == "Frankie, Maya and Luca! Triple yay, lovely to see your family again.", "Three children, returning family")
    page.locator("#qlf-remove-child").click()
    check(page.locator("[data-lab-speech]").inner_text() == "Frankie and Maya! Double yay, lovely to see your family again.", "Removed sibling updates greeting")
    for number in (0, 1):
        prefix = f"#child-{number}-"
        page.locator(prefix + "last").fill("Example")
        page.locator(prefix + "age").select_option("9")
        page.locator(prefix + "experience").select_option("new")
        page.locator(prefix + "session").select_option("sat9")
        page.locator(prefix + "photo").select_option("no")
    page.locator("#qlf-next").click()
    check(page.locator("[data-lab-speech]").inner_text() ==
          "Excitement! Frankie and Maya are on the way. Back for more making!",
          "Returning family's stage three")
    context.close()


def mobile(browser, url, output):
    context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    response = page.goto(url, wait_until="domcontentloaded")
    check(response and response.status == 200, "Mobile page loads")
    side = page.locator(".qll-side")
    form = page.locator(".qll-lab__form-column")
    check(side.is_visible(), "Mobile mascot greeting remains visible")
    check(side.bounding_box()["y"] < form.bounding_box()["y"], "Mobile scene should precede form")
    check(page.locator(".qll-side__mascot").bounding_box()["width"] < 110, "Compact unframed Q on mobile")
    check(page.locator(".qlf-form input").first.is_visible() is False, "Hidden later step fields are not shown")
    page.locator(".qll-lab").screenshot(path=str(output / "little-lab-mobile.png"), animations="disabled")
    context.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=Path("site-quality-report"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[1]
    with serve(root) as url, sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            desktop(browser, url, args.out)
            mobile(browser, url, args.out)
        finally:
            browser.close()
    print("Little Lab: desktop, mobile, form journey, greeting, paper note and no-submission checks passed.")


if __name__ == "__main__":
    main()
