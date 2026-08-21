import { WebSocketServer, WebSocket } from "ws";
import {Server}  from "http";


const clients = new Set<WebSocket>()
let wss: WebSocketServer

export const initialWebsocket = (server:Server)=>{
    wss = new  WebSocketServer({server})

    wss.on("connection", (ws)=>{
        clients.add(ws)
        console.log("Connected Port(websocket)")
        
    });
}

export const broadcastMessage =({event, data}:{event:string, data:unknown})=>{


    const payload = JSON.stringify({event, data})
    for(const client of clients){
        clients
    }
   

    


}