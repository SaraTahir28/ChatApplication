const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_URL = isLocal
  ? "http://localhost:3000"
  : "https://saratahir-chatapp-backend.hosting.codeyourfuture.io";

//implementing generating userID's
function generateUserId(){
  return crypto.randomUUID() //built-in Web API for generating random ID's
}
//Giving each browser a permanent identity.
let userID = localStorage.getItem("userID")
if(!userID){
  userID =  generateUserId()
  localStorage.setItem("userID",userID)
}
//to ensure name is still displaying on UI on page refresh 
const savedName = localStorage.getItem("username");
if (savedName) {
  document.getElementById("user").value = savedName;
}

const container = document.getElementById("messages")

function addMessageToUI(msg){
  const list = document.createElement("li");

  // Determine if this message is from the current user 
  const isMine = msg.userId === userID;
  
  list.dataset.id = msg.id;

  list.innerHTML = `
  <div class="message ${isMine ? "right" : "left"}">
    <span class="username">${msg.username}</span>
    <span class="text">${msg.message}</span>
    <div class="reactions">
      <button class="like-btn">❤️</button>
      <span class="like-count">${msg.likes}</span>
      <button class="dislike-btn">👎</button>
      <span class="dislike-count">${msg.dislikes}</span>
    </div>
  </div>
`;

  container.append(list)
  container.scrollTop = container.scrollHeight //go to bottom of container when a new message arrives.
  return list;
}
function reactionHandlers(li, msg){
  
 const likeBtn = li.querySelector(".like-btn");
 const dislikeBtn = li.querySelector(".dislike-btn");

 const likeCount = li.querySelector(".like-count");
 const dislikeCount = li.querySelector(".dislike-count");
 const previous = localStorage.getItem(`reaction-${msg.id}`);

if (previous === "likes") {
  likeBtn.disabled = true;
  dislikeBtn.disabled = false;
}

if (previous === "dislikes") {
  dislikeBtn.disabled = true;
  likeBtn.disabled = false;
}

 likeBtn.addEventListener("click", () => {
   handleReaction(msg.id, "likes", likeBtn, dislikeBtn, likeCount, dislikeCount); });
 dislikeBtn.addEventListener("click", () => {
   handleReaction(msg.id, "dislikes", likeBtn, dislikeBtn, likeCount, dislikeCount); }); 
}
function handleReaction(id, type, likeBtn, dislikeBtn) {
  if (type === "likes") {
    likeBtn.disabled = true;
    dislikeBtn.disabled = false;
  } else {
    dislikeBtn.disabled = true;
    likeBtn.disabled = false;
  }

  sendReactionToServer(id, type);
}

function sendReactionToServer(id, type) {
  fetch(`${API_URL}/messages/${id}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type,userID })
  });
}
//share form submission extracted into a function
async function handleFormSubmit(sendFunction) {
  const message = document.getElementById("message").value;
  const user = document.getElementById("user").value;

  localStorage.setItem("username", user);

  if (!message.trim() || !user.trim()) {
    alert("Both message and user are required.");
    return;
  }

  const formData = { userID, user, message };

  await sendFunction(formData);

  document.getElementById("message").value = "";
}
