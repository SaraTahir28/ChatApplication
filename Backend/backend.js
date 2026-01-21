import express from "express";
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

const port = process.env.PORT || 3000; //listen to port provided by the hosting env || local machine

const messages = [] //iniializing an empty array of messages- only gets loaded with Post method for the first time 
const callBacksForNewMessages= [] // no of callbacks in the array === no of clients/browsers currently waiting for a new message.
const reactions = []
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
while(callBacksForNewMessages.length > 0){
  const callback = callBacksForNewMessages.pop()
  callback([newMessage]);
}
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
  // Notify long-poll clients
  while (callBacksForNewMessages.length > 0) {
    const callback = callBacksForNewMessages.pop();
    callback([message]);
  }

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

app.listen(port, "0.0.0.0", () =>{ 
  console.log(`Quote server listening on port ${port}`); });