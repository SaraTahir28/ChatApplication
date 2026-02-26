import express from "express";
import http from "http";
import { WebSocketServer,WebSocket } from "ws";

import cors from "cors";
const app = express();
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "https://saratahir-chatapp-frontend.hosting.codeyourfuture.io/"//In production, only this domain is allowed to call your backend.
      : "*" //“Allow requests from any origin when developing locally
  })
);

app.use(express.json()); //parses incoming Json as js object 
//serving frontend folder

app.use(express.static("Frontend"));

//Attached WebSocket Setup


const server = http.createServer(app)
const wss = new WebSocketServer({server})
const wsClients = new Set(); // Store all currently connected WebSocket clients
wss.on("connection", (ws) => {
  wsClients.add(ws);
  console.log("WebSocket client connected");


ws.on("message", (data)=> {
  const {userID, user, message } = JSON.parse(data);

const nextID = messages.length === 0 ? 1 : messages[messages.length-1].id +1 //if no messages  id =1 else increment as messages increase.
const timestamp = Date.now()    //Generating a timestamps for when the server recives the message

if(!Object.hasOwn(users,userID)){
  users[userID] = {
    userId: userID,
    username: user
  }
}
else {
   if (users[userID].username !== user) { 
    users[userID].username = user;
   } 
  }

const newMessage = {   
    id: nextID,
    message: message,
    timestamp: timestamp,
    userId: userID,
    username: users[userID].username,//shows the updated name incase user changes the name
    likes:0,
    dislikes:0 
};
//saving it in the messages array 
messages.push(newMessage);
broadcast("new-message", newMessage);
})
ws.on("close", () => {
    wsClients.delete(ws);
    console.log("WebSocket client disconnected");
  });
})
const port = process.env.PORT || 3000; //listen to port provided by the hosting env || local machine

const messages = [] //iniializing an empty array of messages- only gets loaded with Post method for the first time 
const callBacksForNewMessages= [] // no of callbacks in the array === no of clients/browsers currently waiting for a new message.
const reactions = []

//Setting a unified broadcast function to support long polling and websockets


function broadcast(type, message) {
  const messageData = { type, message }
  const json = JSON.stringify(messageData); //converting to JSON string as websockets cant send JS objects
//sending update to all ws clients 
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {  //client.readystate is a property of websockets
      client.send(json);
    } 
  });
//sending update to all longpolling clients
  while (callBacksForNewMessages.length > 0) {
    const callback = callBacksForNewMessages.pop();
    callback([messageData.message]);
  }
}



//longpolling logic - returns only messages newer than since.
function getMessagesSince(timestamp) {
  if (!timestamp) return messages; // first load
  return messages.filter(msg => msg.timestamp > timestamp);
}


//The users object maps each userID(becomes a key with its own object) to a user profile object.
const users ={} 

//creating a post  message route and modifying the message object 

app.post("/messages", (req, res) => {
const {userID,user, message} = req.body;    //Extracting the frontend data
const nextID = messages.length === 0 ? 1 : messages[messages.length-1].id +1 //if no messages  id =1 else increment as messages increase.
const timestamp = Date.now()    //Generating a timestamps for when the server recives the message

if(!Object.hasOwn(users,userID)){
  users[userID] = {
    userId: userID,
    username: user
  }
}
else {
   if (users[userID].username !== user) { 
    users[userID].username = user;
   } }

const newMessage = {   //Building New message object 
    id: nextID,
    message: message,
    timestamp: timestamp,
    userId: userID,
    username: users[userID].username,//shows the updated name incase user changes the name
    likes:0,
    dislikes:0 
};
//saving it in the messages array 
messages.push(newMessage);
broadcast("new-message", newMessage);
res.json({ status: "ok" });

});

//new post route for counting reactions
app.post("/messages/:id/react", (req, res) => {
  const id = Number(req.params.id);
  const { type, userID } = req.body;

  const message = messages.find(m => m.id === id);
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  // Remove any previous reaction from this user for this message
  const existing = reactions.find(r => r.messageId === id && r.userId === userID);
  if (existing) {
    reactions.splice(reactions.indexOf(existing), 1);
  }

  // Add the new reaction
  reactions.push({ messageId: id, userId: userID, type });

  // Recalculate counts
  message.likes = reactions.filter(r => r.messageId === id && r.type === "likes").length;
  message.dislikes = reactions.filter(r => r.messageId === id && r.type === "dislikes").length;
// Update timestamp so long-poll sees this as a NEW update 
  message.timestamp = Date.now();

broadcast("reaction-update", message);

res.json({ status: "ok" });

});


//updating the get route to support long polling
app.get("/messages", (req, res) => {
  const since = Number(req.query.since) || 0; //reads since query from url and converts it into Number, if since is missing fallbacks to 0 

  const newMessages = getMessagesSince(since);

  if (newMessages.length > 0) {
  //We already have new messages so respond immediately
    return res.json(newMessages);
  }

  //Otherwise, wait for new messages
  callBacksForNewMessages.push((messagesToSend) => {
    res.json(messagesToSend);
  });
});

//Replaced app.listen 
server.listen(port, "0.0.0.0", () =>{ 
  console.log(`server(HTTP + Websocket)running on port ${port}`); });