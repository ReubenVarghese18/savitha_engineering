import subprocess
import json
import os

STITCH_API_KEY = os.environ.get("STITCH_API_KEY", "")
PROJECT_ID = "7370715976177555248"

screens = {
    "grid_view": "74071b31cd7b4683ab42322157725399",
    "list_view": "8388857797273482468",
    "empty_state": "51939db83fb04969a20f7a45a435eec9",
    "loading_state": "a038087783244dc29181c24f1f30da80"
}

out_dir = r"c:\Users\Reuben\Documents\antigravity\savitha engineering\backend\stitch_screens"
os.makedirs(out_dir, exist_ok=True)

env = os.environ.copy()
env["STITCH_API_KEY"] = STITCH_API_KEY

for name, screen_id in screens.items():
    print(f"Fetching {name} ({screen_id})...")
    data_arg = json.dumps({"projectId": PROJECT_ID, "screenId": screen_id})
    
    # Run the npx command
    cmd = ["npx", "-y", "@_davideast/stitch-mcp", "tool", "get_screen_code", "-d", data_arg, "-o", "json"]
    
    try:
        # shell=True might be needed on Windows for npx
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            print(f"Error fetching {name}: {result.stderr}")
            continue
            
        # Parse JSON
        output_data = json.loads(result.stdout)
        html_content = output_data.get("htmlContent", "")
        
        # Save HTML file
        out_path = os.path.join(out_dir, f"{name}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        print(f"Successfully saved {name} to {out_path} ({len(html_content)} bytes)")
    except Exception as e:
        print(f"Exception fetching {name}: {e}")

print("All done!")
