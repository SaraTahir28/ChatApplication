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
  list.dataset.id = msg.id;

  list.innerHTML = `
  <div class="message-line"> 
  <span class="username">${msg.username}</span> 
  <span class="text">${msg.message}</span>
  </div> 
  <div class="reactions"> 
  <button class="like-btn">❤️</button> 
  <span class="like-count">${msg.likes}</span> 
  <button class="dislike-btn">👎</button>
  <span class="dislike-count">${msg.dislikes}</span> 
  </div> `;
  container.append(list)
  container.scrollTop = container.scrollHeight //go to bottom of container when a new message arrives.
  return list;
}

document.getElementById("message-form").addEventListener("submit",async(e)=>{
  e.preventDefault() //prevents page from refreshing on form submission
  const message = document.getElementById("message").value;
  const user = document.getElementById("user").value;
  
  localStorage.setItem("username",user)
  
  //Adding Validation to check both author and quote are added
  if (!message.trim() || !user.trim()) 
    { alert("Both message and user are required."); return;
    }
  
    try { 
    const response = await fetch(`${API_URL}/messages`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userID,user, message }) 
      }); 
   
      const text = await response.text(); 
      console.log("Server response:", text); 
  
      //show backend error message to user 
  if(!response.ok){
    alert("Error: " + text);
  }
  document.getElementById("message").value = "";
   
  } catch (error) { 
      console.error("Failed to add message:", error);
       alert("Error adding message"); 
    } 
  });
//imlementing longpolling (One request stays open and completes only when a new message arrives.)
let lastTimestamp = 0;


   async function longPoll() {
  try {
    const url = `${API_URL}/messages?since=${lastTimestamp}`;
    const raw = await fetch(url);
    const newMessages = await raw.json();

    if (newMessages.length > 0) {
      for (const msg of newMessages) {
        console.log("DEBUG MESSAGE:", msg);
        const existing = container.querySelector(`li[data-id="${msg.id}"]`);

        if (existing) {
          // Update counts instead of adding a duplicate
          const likeCount = existing.querySelector(".like-count");
          const dislikeCount = existing.querySelector(".dislike-count");

          likeCount.textContent = msg.likes;
          dislikeCount.textContent = msg.dislikes;
          lastTimestamp = msg.timestamp; //update timestamp for reaction updates
          continue; // Skip adding a new <li>
        }

        // Otherwise its a brand new message
        const li = addMessageToUI(msg);
        reactionHandlers(li, msg);
        lastTimestamp = msg.timestamp;
      }
    }

    longPoll(); // Start next poll immediately

  } catch (err) {
    console.error("Long polling failed", err);
    setTimeout(longPoll, 2000);
  }
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

longPoll();