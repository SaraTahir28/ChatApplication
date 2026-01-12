import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json()); //parses incoming Json as js object 

const port = process.env.PORT || 3000; //listen to port provided by the hosting env || local machine

const messages = [] //iniializing an empty array of messages- only gets loaded with Post method for the first time 

//creating a post  message route and modifying the message object 
app.post("/messages", (req, res) => {
const {user, message} = req.body;    //Extracting the frontend data
const nextID = messages.length === 0 ? 1 : messages[messages.length-1].id +1 //if no messages  id =1 else increment as messages increase.
const timestamp = Date.now()    //Generating a timestamps for when the server recives the message

const newMessage = {   //Building New message object 
    id: nextID,
    user: user,
    message: message,
    timestamp: timestamp
};
//saving it in the messages array 
messages.push(newMessage);
//send the new created message to frontend
res.json(newMessage);
});

app.get("/messages", (req, res) => {
  res.json(messages)
})
app.listen(port, "0.0.0.0", () =>{ 
  console.log(`Quote server listening on port ${port}`); });