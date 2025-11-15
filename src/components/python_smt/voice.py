# import json
# import asyncio
# import websockets
# from vosk import Model, KaldiRecognizer

# model = Model("model")

# async def handler(websocket):
#     print("Client connected!")

#     recognizer = KaldiRecognizer(model, 16000)

#     async for message in websocket:
#         # Браузер присылает бинарный PCM
#         if isinstance(message, bytes):
#             if recognizer.AcceptWaveform(message):
#                 result = json.loads(recognizer.Result())
#                 text = result.get("text", "")
#                 print("Final:", text)
#                 await websocket.send(json.dumps({"final": text}))
#             else:
#                 partial = json.loads(recognizer.PartialResult()).get("partial", "")
#                 await websocket.send(json.dumps({"partial": partial}))
#         else:
#             print("Received non-bytes message:", message)

# async def main():
#     async with websockets.serve(handler, "0.0.0.0", 4269, max_size=10_000_000):
#         print("Vosk server running ws://localhost:4269")
#         await asyncio.Future()

# asyncio.run(main())
import json
import asyncio
import websockets
import time
from vosk import Model, KaldiRecognizer
from difflib import SequenceMatcher

# ───────────────────────────────
# Настройки
# ───────────────────────────────
MODEL_PATH = "model"          # путь к модели Vosk
SILENCE_THRESHOLD = 0.8       # секунд тишины = фраза закончена
FINAL_COOLDOWN = 0.5          # минимальное время между финалами
SIMILARITY_THRESHOLD = 0.8    # порог схожести для антиспама (0..1)

# ───────────────────────────────
# Загружаем модель
# ───────────────────────────────
model = Model(MODEL_PATH)

# ───────────────────────────────
# Функция схожести строк
# ───────────────────────────────
def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

# ───────────────────────────────
# Обработчик соединения
# ───────────────────────────────
async def handler(websocket):
    print("Client connected!")

    recognizer = KaldiRecognizer(model, 16000)

    last_audio_time = time.time()     
    last_final_text = ""              
    last_final_time = 0               
    buffer_text = ""                  

    try:
        async for message in websocket:
            if not isinstance(message, bytes):
                continue

            last_audio_time = time.time()

            if recognizer.AcceptWaveform(message):
                result = json.loads(recognizer.Result())
                text = result.get("text", "").strip()
                if text:
                    buffer_text = text
            else:
                partial = json.loads(recognizer.PartialResult()).get("partial", "")
                if partial:
                    buffer_text = partial
                    await websocket.send(json.dumps({"partial": partial}))

            now = time.time()
            if buffer_text and (now - last_audio_time) > SILENCE_THRESHOLD:
                # Антиспам по схожести
                if similar(buffer_text, last_final_text) < SIMILARITY_THRESHOLD and (now - last_final_time) > FINAL_COOLDOWN:
                    last_final_text = buffer_text
                    last_final_time = now
                    print("Final:", buffer_text)
                    await websocket.send(json.dumps({"final": buffer_text}))
                buffer_text = ""  # очищаем буфер после отправки
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")

# ───────────────────────────────
# Запуск сервера
# ───────────────────────────────
async def main():
    async with websockets.serve(handler, "0.0.0.0", 4269, max_size=10_000_000):
        print("Vosk server running ws://localhost:4269")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
