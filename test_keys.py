import sys
import os
from dotenv import load_dotenv

load_dotenv()
print("Gemini Key:", os.getenv("GEMINI_API_KEY"))
print("Groq Key:", os.getenv("GROQ_API_KEY"))

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.agent import AIConciergeAgent
import logging
logging.basicConfig(level=logging.DEBUG)

agent = AIConciergeAgent()
print("Initialized agent.")

try:
    res = agent.chat("Where can I eat dinner?")
    print("Response:", res)
except Exception as e:
    print("Error:", e)
