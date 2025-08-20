from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application is starting up...")
    app.state.db = sqlite3.connect('merchandises.db', check_same_thread=False)
    app.state.db.row_factory = sqlite3.Row
    app.state.db.execute('PRAGMA journal_mode=WAL')
    yield
    print("Application is shutting down...")
    app.state.db.close()

app = FastAPI(lifespan=lifespan)
# CORSの設定を追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            if data["type"] == "scan":
                id = data["id"]
                cursor = app.state.db.cursor()
                cursor.execute("SELECT id, name, price FROM products WHERE id = ?", (id,))
                result = cursor.fetchone()

                if result:
                    await websocket.send_json({
                        "status": "ok",
                        "product": {
                            "id": result["id"],
                            "name": result["name"],
                            "price": result["price"]
                        }
                    })
                else:
                    await websocket.send_json({"status": "error", "message": "商品が見つかりません"})

    except Exception as e:
        await websocket.send_json({"status": "error", "message": str(e)})
