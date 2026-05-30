"""AI Chat Widget Server — lightweight DeepSeek API proxy.
One command to run: python app.py
"""
import os, json
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
API_URL = "https://api.deepseek.com/v1/chat/completions"
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT", "你是一个友好的AI客服助手，请用中文回答用户问题。回答要简洁专业。")
MODEL = os.getenv("MODEL", "deepseek-chat")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    if not messages:
        return jsonify({"error": "messages required"}), 400

    payload = {
        "model": MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "max_tokens": 1024,
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        r = requests.post(API_URL, json=payload, headers=headers, timeout=30)
        r.raise_for_status()
        body = r.json()
        reply = body["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat/stream", methods=["POST"])
def chat_stream():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    if not messages:
        return jsonify({"error": "messages required"}), 400

    payload = {
        "model": MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "max_tokens": 1024,
        "temperature": 0.7,
        "stream": True,
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    def generate():
        try:
            r = requests.post(API_URL, json=payload, headers=headers, timeout=30, stream=True)
            for line in r.iter_lines(decode_unicode=True):
                if line and line.startswith("data:") and not line.startswith("data: [DONE]"):
                    chunk = json.loads(line[5:].strip())
                    delta = chunk["choices"][0].get("delta", {}).get("content", "")
                    if delta:
                        yield f"data: {json.dumps({'content': delta}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return Response(generate(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"AI Chat Widget Server running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
