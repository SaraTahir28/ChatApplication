//to have hostory of message on websockets version of app 
async function loadhistory(){
  const res = await fetch(`${API_URL}/messages?since=0`)
  const history = await res.json();

  history.forEach((msg)=>{
    const li = addMessageToUI(msg);
    reactionHandlers(li,msg);
  })
}
loadhistory()

const socket = new WebSocket(   // Connect to WebSocket server
  API_URL.replace("http", "ws") + "/ws"
);
//Handle incoming messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
//unwrap the actual message object
  const msg = data.message;
// Check if message already exists - e.g reaction update
  const existing = container.querySelector(`li[data-id="${msg.id}"]`);

  if (existing) {
    existing.querySelector(".like-count").textContent = msg.likes;
    existing.querySelector(".dislike-count").textContent = msg.dislikes;
    return;
  }
// else add new message
  const li = addMessageToUI(msg);
  reactionHandlers(li, msg);
};

socket.onerror = (err) => {  //handle connection errors
  console.error("WebSocket error:", err);
};

document.getElementById("message-form").addEventListener("submit", (e) => { //form submissin
  e.preventDefault();

  handleFormSubmit((formData) => {
    socket.send(JSON.stringify(formData));
  });
});
