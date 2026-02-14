import { WebSocketServer , WebSocket} from "ws";

for (let i = 0; i < 10; i++) {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws", {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    ws.on("open", () => {
        console.log(`Socket ${i} opened`);
    });

    ws.on("close", (code, reason) => {
        console.log(`Socket ${i} closed: ${code} ${reason}`);
    });
}
