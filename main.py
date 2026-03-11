from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from routes import router

app = FastAPI()

@app.middleware("http")
async def normalize_api_prefix(request: Request, call_next):
    if request.scope.get("path", "").startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:] or "/"
    return await call_next(request)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/", response_class=HTMLResponse)
async def root():
    html = """
    <html>
    <head>
      <title>Route Postcard</title>
      <style>
        body { background-color: #1e1e1e; color: #f0f0f0; font-family: Arial, Helvetica, sans-serif; padding: 2rem; }
        h1 { color: #ffcc00; }
        a { color: #4da6ff; }
        .endpoint { margin-bottom: 1rem; }
        .code { background: #2e2e2e; padding: 0.5rem; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <h1>Route Postcard</h1>
      <p>Print‑ready Korean adventures, delivered as editorial postcards.</p>
      <h2>Available Endpoints</h2>
      <div class="endpoint"><strong>GET</strong> <span class="code">/health</span> – health check.</div>
      <div class="endpoint"><strong>POST</strong> <span class="code">/plan</span> – generate a day‑by‑day postcard itinerary.</div>
      <div class="endpoint"><strong>POST</strong> <span class="code">/insights</span> – get AI‑driven insights for a selection.</div>
      <h2>Tech Stack</h2>
      <ul>
        <li>FastAPI 0.115.0</li>
        <li>Python 3.12+</li>
        <li>PostgreSQL via SQLAlchemy 2.0</li>
        <li>DigitalOcean Serverless Inference (openai‑gpt‑oss‑120b)</li>
      </ul>
      <p><a href="/docs">OpenAPI Docs</a> | <a href="/redoc">ReDoc</a></p>
    </body>
    </html>
    """
    return html
