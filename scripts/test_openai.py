from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENAI_API_KEY")
print(f"Key loaded: {key[:10]}...{key[-5:] if key else 'None'}")

try:
    client = OpenAI(api_key=key)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello, are you online?"}],
        max_tokens=10
    )
    print("✅ OpenAI Connection Successful!")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"❌ OpenAI Connection Failed: {e}")
