import os
import sys
import time
import shutil
import cv2
from pathlib import Path
from playwright.sync_api import sync_playwright

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def record_cardiovision_demo():
    output_dir = Path("docs/demo_video").resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print("[*] Initializing Playwright video capture with Microsoft Edge...")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=[
                "--enable-webgl",
                "--use-gl=angle",
                "--enable-gpu-rasterization",
                "--no-sandbox",
            ],
        )

        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(output_dir),
            record_video_size={"width": 1920, "height": 1080},
        )

        page = context.new_page()

        print("[*] Navigating to CardioVision 3D...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(3)

        # ----------------------------------------------------
        # Scene 1: Clinical Overview & 3D Heart Landing
        # ----------------------------------------------------
        print("[Scene 1] Overview and 3D Heart Landing")
        time.sleep(4)

        # ----------------------------------------------------
        # Scene 2: 3D Heart Anatomy & Hemodynamic Stenosis Simulation
        # ----------------------------------------------------
        print("[Scene 2] Navigating to 3D Viewer & Hemodynamics")
        page.click("button:has-text('3D Viewer')")
        time.sleep(3)

        # Perform smooth 360-degree rotation of the heart canvas
        canvas = page.locator(".canvas-stage")
        if canvas.count() > 0:
            box = canvas.bounding_box()
            if box:
                cx = box["x"] + box["width"] / 2
                cy = box["y"] + box["height"] / 2

                print("   -> Orbiting 3D heart model in 360 degrees...")
                page.mouse.move(cx, cy)
                page.mouse.down()
                for dx in range(0, 220, 15):
                    page.mouse.move(cx + dx, cy - (dx * 0.2))
                    time.sleep(0.04)
                page.mouse.up()
                time.sleep(1.5)

                page.mouse.move(cx + 200, cy - 40)
                page.mouse.down()
                for dx in range(200, -200, -18):
                    page.mouse.move(cx + dx, cy + 20)
                    time.sleep(0.04)
                page.mouse.up()
                time.sleep(1.5)

        # Test Scenario: Isolated LAD Stenosis
        print("   -> Selecting Isolated LAD Stenosis (85%)")
        lad_btn = page.locator(".case-pill-button:has-text('LAD')")
        if lad_btn.count() > 0:
            lad_btn.first.click()
            time.sleep(3.5)

        # Test Scenario: Isolated RCA Stenosis
        print("   -> Selecting Isolated RCA Stenosis (90%)")
        rca_btn = page.locator(".case-pill-button:has-text('RCA')")
        if rca_btn.count() > 0:
            rca_btn.first.click()
            time.sleep(3.5)

        # Test Scenario: Triple-Vessel CAD
        print("   -> Selecting Triple-Vessel CAD (95%)")
        triple_btn = page.locator(".case-pill-button:has-text('Triple')")
        if triple_btn.count() > 0:
            triple_btn.first.click()
            time.sleep(3.5)

        # Test Scenario: Normal Patent Baseline
        print("   -> Selecting Normal Patent Baseline (0%)")
        normal_btn = page.locator(".case-pill-button:has-text('Normal')")
        if normal_btn.count() > 0:
            normal_btn.first.click()
            time.sleep(3)

        # ----------------------------------------------------
        # Scene 3: New Analysis & AI Document OCR Extractor
        # ----------------------------------------------------
        print("[Scene 3] Navigating to New Analysis & AI Document OCR Extractor")
        page.click("button:has-text('New Analysis')")
        time.sleep(2.5)

        # Scroll down to show features
        page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        time.sleep(2)
        page.evaluate("window.scrollBy({ top: -400, behavior: 'smooth' })")
        time.sleep(1.5)

        # Click Sample 1 in OCR extractor
        print("   -> Running OCR Extractor on Sample Clinical Document")
        ocr_sample = page.locator(".sample-doc-btn")
        if ocr_sample.count() > 0:
            ocr_sample.first.click()
            time.sleep(2.5)  # Wait for extraction progress animation

        # Click Auto-fill
        autofill_btn = page.locator(".apply-data-btn")
        if autofill_btn.count() > 0:
            print("   -> Auto-filling 52 Clinical Biomarker Fields...")
            autofill_btn.click()
            time.sleep(1.5)

        # Run Multi-Target Risk Analysis
        print("   -> Running ML Multi-Target Prediction...")
        analyze_btn = page.locator(".sticky-submit button")
        if analyze_btn.count() > 0:
            analyze_btn.first.click()
            time.sleep(3.5)

        # Scroll to view prediction radar and feature explanations
        page.evaluate("window.scrollBy({ top: 600, behavior: 'smooth' })")
        time.sleep(3.5)

        # ----------------------------------------------------
        # Scene 4: Printable Hospital Clinical Report Modal
        # ----------------------------------------------------
        print("[Scene 4] Opening Printable Clinical Report")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        time.sleep(1)
        report_btn = page.locator("button:has-text('Export Clinical Report')")
        if report_btn.count() > 0:
            report_btn.first.click()
            time.sleep(4.5)  # Display the report modal

            close_btn = page.locator("button:has-text('Close')")
            if close_btn.count() > 0:
                close_btn.first.click()
                time.sleep(1)

        # ----------------------------------------------------
        # Scene 5: Patient Records (Admin Vault)
        # ----------------------------------------------------
        print("[Scene 5] Navigating to Patient Records (Admin)")
        page.locator("button:has-text('Patient Records (Admin)')").first.click()
        time.sleep(2.5)

        # Type in search
        search_input = page.locator("input[placeholder*='Search']")
        if search_input.count() > 0:
            search_input.first.fill("LAD")
            time.sleep(1.5)
            search_input.first.fill("")
            time.sleep(1)

        # Click Load into 3D Viewer on first record
        load_3d_btn = page.locator("button:has-text('Load into 3D Viewer')")
        if load_3d_btn.count() > 0:
            print("   -> Loading Patient Record directly into 3D Heart Viewer...")
            load_3d_btn.first.click()
            time.sleep(4)

        # ----------------------------------------------------
        # Scene 6: Model Quality & Audit Dashboard
        # ----------------------------------------------------
        print("[Scene 6] Navigating to Model Quality & Audit Dashboard")
        page.click("button:has-text('Model Quality')")
        time.sleep(4)

        # Conclude
        print("[*] Completing video capture...")
        time.sleep(2)

        # Close context to flush video to disk
        video_obj = page.video
        context.close()
        browser.close()

        saved_path = video_obj.path() if video_obj else None
        print(f"[*] Raw video recorded to: {saved_path}")

        if saved_path and os.path.exists(saved_path):
            target_webm = output_dir / "cardiovision3d_demo_walkthrough.webm"
            target_mp4 = output_dir / "cardiovision3d_demo_walkthrough.mp4"

            shutil.copyfile(saved_path, str(target_webm))
            print(f"[+] WebM Video ready at: {target_webm} ({os.path.getsize(target_webm) / (1024*1024):.2f} MB)")

            # Convert to MP4 using OpenCV
            print("[*] Transcoding WebM to MP4 using OpenCV...")
            try:
                cap = cv2.VideoCapture(str(target_webm))
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                if fps <= 0 or fps > 60:
                    fps = 25.0

                fourcc = cv2.VideoWriter_fourcc(*"mp4v")
                out = cv2.VideoWriter(str(target_mp4), fourcc, fps, (width, height))

                frame_count = 0
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                    out.write(frame)
                    frame_count += 1

                cap.release()
                out.release()
                if os.path.exists(str(target_mp4)) and os.path.getsize(str(target_mp4)) > 1000:
                    print(f"[+] MP4 Video successfully generated: {target_mp4} ({os.path.getsize(target_mp4) / (1024*1024):.2f} MB, {frame_count} frames)")
            except Exception as e:
                print(f"Note on MP4 conversion: {e}. WebM is ready and valid!")

if __name__ == "__main__":
    record_cardiovision_demo()
