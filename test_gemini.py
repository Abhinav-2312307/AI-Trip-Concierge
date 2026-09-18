import os
import requests

key = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
payload = {
    "contents": [{"parts": [{"text": "Say hello."}]}],
}
try:
    print("Calling Gemini 3.6...")
    res = requests.post(url, json=payload, timeout=15)
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", e)
