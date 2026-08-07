import json
import re
import os

with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\task-126.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

html = data['htmlContent']

# Clean up HTML functions to convert to JSX
def clean_html_to_jsx(text):
    # Convert class to className
    text = text.replace(' class=', ' className=')
    text = text.replace('<html class=', '<html className=')
    text = text.replace('<body class=', '<body className=')
    
    # Self close tags: br, img, input, hr, path, meta, link
    # We can do this with simple regex replacements
    text = re.sub(r'<br\s*>', '<br />', text)
    text = re.sub(r'<hr\s*>', '<hr />', text)
    
    # For img, input, path - make sure they are self closed if they aren't already
    # For img
    text = re.sub(r'<img([^>]*)(?<!/)>', r'<img\1 />', text)
    # For input
    text = re.sub(r'<input([^>]*)(?<!/)>', r'<input\1 />', text)
    # For path
    text = re.sub(r'<path([^>]*)(?<!/)>', r'<path\1 />', text)
    
    # Handle style attribute: style="background-color: #FFFFFF;" -> style={{backgroundColor: "#FFFFFF"}}
    def style_repl(match):
        style_str = match.group(1)
        # Parse styles into a dictionary
        styles = {}
        for item in style_str.split(';'):
            if ':' in item:
                k, v = item.split(':', 1)
                k = k.strip()
                v = v.strip()
                # Convert kebab-case to camelCase
                k_camel = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
                styles[k_camel] = v
        # Return React style format
        return 'style={{' + ', '.join([f'{k}: "{v}"' for k, v in styles.items()]) + '}}'
        
    text = re.sub(r'style="([^"]*)"', style_repl, text)
    
    # Replace other attributes
    text = text.replace('stroke-linecap=', 'strokeLinecap=')
    text = text.replace('stroke-linejoin=', 'strokeLinejoin=')
    text = text.replace('stroke-width=', 'strokeWidth=')
    text = text.replace('fill-rule=', 'fillRule=')
    text = text.replace('clip-rule=', 'clipRule=')
    
    return text

# Find components
# 1. Navbar: <nav ...> ... </nav>
nav_match = re.search(r'<nav[^>]*>.*?</nav>', html, re.DOTALL)
navbar_html = nav_match.group(0) if nav_match else ""

# 2. Hero: <section ...> (containing Engineering excellence) to the end of that section
# Let's locate the sections
sections = re.findall(r'<section[^>]*>.*?</section>', html, re.DOTALL)
hero_html = ""
advantage_html = ""
marquee_divider_html = ""
catalog_html = ""
tqm_html = ""
infra_html = ""
founders_html = ""
contact_html = ""
footer_html = ""

# Find marquee divider between sections (it has "TRUSTED BY INDUSTRY GIANTS")
marquee_match = re.search(r'<div className="bg-black text-white px-6 text-center border-b-4 border-white">.*?<section className="text-black brutalist-border border-x-0 overflow-hidden py-20 translate-y-0 opacity-100" style=\{\{backgroundColor: "#FFFFFF"\}\}>.*?</section>', clean_html_to_jsx(html), re.DOTALL)
if marquee_match:
    marquee_divider_html = marquee_match.group(0)

# Let's assign sections based on their content/id
for s in sections:
    s_jsx = clean_html_to_jsx(s)
    if "excellence" in s_jsx and "Hero" in s_jsx or "ESTABLISHED 1976" in s_jsx:
        hero_html = s_jsx
    elif "THE SAVITHA" in s_jsx and "ADVANTAGE" in s_jsx:
        advantage_html = s_jsx
    elif 'id="products"' in s_jsx or "PRECISION" in s_jsx and "CATALOG" in s_jsx:
        catalog_html = s_jsx
    elif 'id="services"' in s_jsx or "TOTAL QUALITY" in s_jsx:
        tqm_html = s_jsx
    elif "bg-neon" in s_jsx and "infrastructure" in s_jsx or "PROPRIETARY" in s_jsx:
        infra_html = s_jsx
    elif 'id="founders-legacy"' in s_jsx or "Sajith Daniel Varghese" in s_jsx:
        founders_html = s_jsx
    elif 'id="contact"' in s_jsx or "REQUEST" in s_jsx and "QUOTE" in s_jsx:
        contact_html = s_jsx

footer_match = re.search(r'<footer[^>]*>.*?</footer>', html, re.DOTALL)
if footer_match:
    footer_html = clean_html_to_jsx(footer_match.group(0))

# Create directories
os.makedirs(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components", exist_ok=True)

# Write Navbar
navbar_code = f"""import React from 'react';

export default function Navbar() {{
  const scrollToSection = (id) => {{
    const element = document.getElementById(id);
    if (element) {{
      element.scrollIntoView({{ behavior: 'smooth' }});
    }}
  }};

  return (
    {clean_html_to_jsx(navbar_html)}
  );
}}
"""
with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components\Navbar.jsx", 'w', encoding='utf-8') as f_out:
    f_out.write(navbar_code)

# Write Hero (Hero Section + Advantage Section + Marquee Divider)
hero_code = f"""import React, { {useState, useEffect} } from 'react';

export default function Hero() {{
  const [precision, setPrecision] = useState(0.5);

  useEffect(() => {{
    const interval = setInterval(() => {{
      const val = (0.4 + Math.random() * 0.2).toFixed(1);
      setPrecision(Number(val));
    }}, 3000);
    return () => clearInterval(interval);
  }}, []);

  const scrollToSection = (id) => {{
    const element = document.getElementById(id);
    if (element) {{
      element.scrollIntoView({{ behavior: 'smooth' }});
    }}
  }};

  return (
    <div>
      {hero_html.replace('±0.5', '±{precision.toFixed(1)}')}
      {advantage_html}
      {marquee_divider_html}
    </div>
  );
}}
"""
with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components\Hero.jsx", 'w', encoding='utf-8') as f_out:
    f_out.write(hero_code)

# Write Catalog
catalog_code = f"""import React from 'react';

export default function Catalog() {{
  const scrollToSection = (id) => {{
    const element = document.getElementById(id);
    if (element) {{
      element.scrollIntoView({{ behavior: 'smooth' }});
    }}
  }};

  return (
    {catalog_html}
  );
}}
"""
with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components\Catalog.jsx", 'w', encoding='utf-8') as f_out:
    f_out.write(catalog_code)

# Write TqmSection
tqm_code = f"""import React from 'react';

export default function TqmSection() {{
  return (
    {tqm_html}
  );
}}
"""
with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components\TqmSection.jsx", 'w', encoding='utf-8') as f_out:
    f_out.write(tqm_code)

# Write Infrastructure
infra_code = f"""import React from 'react';

export default function Infrastructure() {{
  return (
    <div>
      {infra_html}
      {founders_html}
    </div>
  );
}}
"""
with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components\Infrastructure.jsx", 'w', encoding='utf-8') as f_out:
    f_out.write(infra_code)

# Write RFQFooter
rfq_code = f"""import React, { {useState} } from 'react';

export default function RFQFooter() {{
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('SELECT CATEGORY');
  
  const [formData, setFormData] = useState({{
    fullName: '',
    company: '',
    requirements: ''
  }});

  const handleInputChange = (e) => {{
    const {{ name, value }} = e.target;
    setFormData((prev) => ({{ ...prev, [name]: value }}));
  }};

  const handleCategorySelect = (category) => {{
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  }};

  const handleSubmit = (e) => {{
    e.preventDefault();
    alert('DATA TRANSMITTED. RESPONSE PENDING.');
    setFormData({{ fullName: '', company: '', requirements: '' }});
    setSelectedCategory('SELECT CATEGORY');
  }};

  return (
    <div>
      {contact_html}
      {footer_html}
    </div>
  );
}}
"""
with open(r"c:\Users\Reuben\Documents\antigravity\savitha engineering\frontend\src\components\RFQFooter.jsx", 'w', encoding='utf-8') as f_out:
    f_out.write(rfq_code)

print("Split and wrote all modular components successfully.")
