import re

products_js_path = r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\data\products.js"

with open(products_js_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix: description: "..." followed by newline then specifications: -> add comma after the closing quote
# Pattern: description line ending with `"` (no comma) followed by newline + spaces + specifications:
fixed = re.sub(
    r'(description: "[^"]*")(\r?\n    specifications:)',
    r'\1,\2',
    content
)

count = content.count('description: "') 
fixed_count = fixed.count('description: "')
print(f"Description fields: {count}")

# Check how many were fixed
original_bad = len(re.findall(r'description: "[^"]*"\r?\n    specifications:', content))
remaining_bad = len(re.findall(r'description: "[^"]*"\r?\n    specifications:', fixed))
print(f"Missing commas fixed: {original_bad - remaining_bad} (from {original_bad} -> {remaining_bad})")

with open(products_js_path, "w", encoding="utf-8") as f:
    f.write(fixed)

print("Done! Commas fixed.")

# Quick verify
with open(products_js_path, "r", encoding="utf-8") as f:
    sample = f.read()
# Show first product
start = sample.find('id: "SE-MELT-001"')
print("\nFirst product sample:")
print(sample[start-4:start+600])
