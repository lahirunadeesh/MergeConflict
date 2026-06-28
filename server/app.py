import os
import webbrowser
import threading
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import uvicorn

app = FastAPI(title="IFS Merge Conflict Resolver")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "ui", "templates"))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "ui", "static")), name="static")


@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/health")
async def health():
    return {"status": "ok"}


def open_browser():
    webbrowser.open("http://localhost:7845")


if __name__ == "__main__":
    threading.Timer(1.0, open_browser).start()
    uvicorn.run(app, host="127.0.0.1", port=7845)
