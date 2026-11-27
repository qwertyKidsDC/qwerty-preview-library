#!/usr/bin/env python3
"""Browser smoke checks for the current enrolment forms using imaginary data."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright
from check_site import serve

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=Path("site-quality-report"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[2] / "qwertylabs"
    with serve(root) as origin, sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for filename in ("classes", "camps", "teen-camps"):
            for width, height in ((1440, 900), (390, 844)):
                context = browser.new_context(viewport={"width": width, "height": height})
                page = context.new_page()
                errors, posts = [], []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.on("request", lambda request: posts.append(request.url) if request.method == "POST" else None)
                response = page.goto(f"{origin}/forms/{filename}.html", wait_until="load")
                assert response and response.ok
                form = page.locator(".studio-form")
                assert form.count() == 1 and form.is_visible()
                assert page.locator("[data-form-mascot]").count() == 1
                page.locator(".form-submit").click()
                assert page.locator("#form-error").is_visible(), "Empty form must fail validation"
                page.locator('input[name="family-type"][value="returning"]').check()
                if filename == "classes":
                    page.locator("#class-time").select_option("sat-9")
                else:
                    page.locator('input[name="camp-days"]').first.check()
                    assert page.locator("#extended-hours").count() == (0 if filename == "teen-camps" else 1)
                page.locator("#child-0-first").fill("Frankie")
                page.locator("#child-0-last").fill("Example")
                page.locator("#parent-first").fill("Alex")
                page.locator("#parent-last").fill("Example")
                page.locator("#parent-phone").fill("0400000000")
                page.locator(".form-submit").click()
                assert page.locator(".form-done").is_visible(), "Valid returning-family form must reach review"
                assert not posts, "Local review must not send a POST"
                assert not errors, errors
                page.screenshot(path=str(args.out / f"form-{filename}-{width}.png"), full_page=True)
                context.close()
        browser.close()
    print("Current enrolment form smoke checks passed.")

if __name__ == "__main__":
    main()
