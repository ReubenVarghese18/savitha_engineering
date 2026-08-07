import subprocess
import json
import os

STITCH_API_KEY = os.environ.get("STITCH_API_KEY", "")
PROJECT_ID = "7370715976177555248"

dropdown_screens = {
    "dropdown_538": "538dacf19f864f25883b6270320266f2",
    "dropdown_380": "3804101888723150997",
    "dropdown_838": "8388857797273482468"
}

out_dir = r"c:\Users\Reuben\Documents\antigravity\savitha engineering\backend\stitch_screens"
os.makedirs(out_dir, exist_ok=True)

env = os.environ.copy()
env["STITCH_API_KEY"] = STITCH_API_KEY

for name, screen_id in dropdown_screens.items():
    print(f"Fetching {name} ({screen_id})...")
    data_arg = json.dumps({"projectId": PROJECT_ID, "screenId": screen_id})
    cmd = ["npx", "-y", "@_davideast/stitch-mcp", "tool", "get_screen_code", "-d", data_arg, "-o", "json"]
    try:
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            print(f"Error fetching {name}: {result.stderr}")
            continue
        output_data = json.loads(result.stdout)
        html_content = output_data.get("htmlContent", "")
        out_path = os.path.join(out_dir, f"{name}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"Successfully saved {name} to {out_path} ({len(html_content)} bytes)")
    except Exception as e:
        print(f"Exception fetching {name}: {e}")

print("All done!")
