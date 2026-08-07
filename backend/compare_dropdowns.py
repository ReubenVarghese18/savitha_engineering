import re

paths = {
    "dropdown_538": r"c:\Users\Reuben\Documents\antigravity\savitha engineering\backend\stitch_screens\dropdown_538.html",
    "dropdown_380": r"c:\Users\Reuben\Documents\antigravity\savitha engineering\backend\stitch_screens\dropdown_380.html",
    "dropdown_838": r"c:\Users\Reuben\Documents\antigravity\savitha engineering\backend\stitch_screens\dropdown_838.html"
}

for name, path in paths.items():
    print(f"\n=== {name} ===")
    content = open(path, "r", encoding="utf-8").read()
    print("Length:", len(content))
    # Find list view image class/width
    images = re.findall(r'<div class="[^"]*md:w-[^"]*">', content)
    print("Image divs:", images)
    # Find sidebar classes
    aside = re.findall(r'<aside class="[^"]*">', content)
    print("Aside:", aside)
    # Check if has grid toggle button
    buttons = re.findall(r'<button [^>]*title="Grid View"[^>]*>', content)
    print("Grid View Buttons:", buttons)
    # Find font styles
    font_grotesk = "Space Grotesk" in content
    font_mono = "JetBrains Mono" in content
    print(f"Space Grotesk: {font_grotesk}, JetBrains Mono: {font_mono}")
