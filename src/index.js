import AgentAPI from "apminsight";
AgentAPI.config();
import express from "express";
import {matchRouter} from "./routes/matches.js";
import http from "http"
import {attachWebSocketServer} from "../ws/server.js";
const PORT = process.env.PORT || 8000;
const HOST=process.env.HOST|| "0.0.0.0";
import { WebSocketServer , WebSocket} from "ws";
import {securityMiddleware} from "./arcjet.js";
import {commentaryRouter} from "./routes/commentary.js";
import cors from 'cors';

const app= express();
const  server=http.createServer(app);

// Add this BEFORE your routes
app.use(cors({
    origin: "http://localhost:5173", // Allow your React dev server
    methods: ["GET", "POST"]
}));
app.use(express.json())
// app.use(securityMiddleware() )
app.use("/matches",matchRouter);
app.use("/matches/:id/commentary",commentaryRouter);

app.get("/",(req,res)=>{
    res.send("Hello World!");
})


const  {broadcastMatchCreated, broadcastCommentary}= attachWebSocketServer(server);

app.locals.broadcastMatchCreated=broadcastMatchCreated;
app.locals.broadcastCommentary=broadcastCommentary;


server.listen(PORT,HOST,()=>{
    const baseUrl=HOST==="0.0.0.0"?`http://localhost/${PORT}`:`http://${HOST}:${PORT}`;
    console.log("Server is running on port: " + baseUrl);
    console.log(`websocket server Listening on port: ${baseUrl.replace('http','ws')}/ws`) ;
})