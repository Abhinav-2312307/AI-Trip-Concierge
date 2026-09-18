import requests
import json
import os

key = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
payload = {
    "model": "fake-model-does-not-exist",
    "messages": [{"role": "user", "content": "hi"}],
}
print("Calling Groq...")
res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=12)
print("Status:", res.status_code)
print("Response:", res.text)
