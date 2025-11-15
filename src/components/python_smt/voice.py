import json
import asyncio
import websockets
from vosk import Model, KaldiRecognizer

model = Model("model")

async def handler(websocket):
    print("Client connected!")

    recognizer = KaldiRecognizer(model, 16000)

    async for message in websocket:
        # Браузер присылает бинарный PCM
        if isinstance(message, bytes):
            if recognizer.AcceptWaveform(message):
                result = json.loads(recognizer.Result())
                text = result.get("text", "")
                print("Final:", text)
                await websocket.send(json.dumps({"final": text}))
            else:
                partial = json.loads(recognizer.PartialResult()).get("partial", "")
                await websocket.send(json.dumps({"partial": partial}))
        else:
            print("Received non-bytes message:", message)

async def main():
    async with websockets.serve(handler, "0.0.0.0", 4269, max_size=10_000_000):
        print("Vosk server running ws://localhost:4269")
        await asyncio.Future()

asyncio.run(main())
