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
async function displayMessages(){
  try{
  const response = await fetch("http://localhost:3000/messages") //talking to backend with a GET request, which only sends back data.
  const data = await response.json() //expecting data to be sent as structured JSON. 
  container.innerHTML=""
    for(const i of data){
        const list = document.createElement("li")
            list.textContent = `${i.username}: ${i.message}`;
            container.append(list)
    }
}
  catch (error) {
  console.error("Failed to fetch messages", error);
  container.innerHTML = "<li>Error fetching messages.</li>";
}
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
    const response = await fetch("http://localhost:3000/messages", {
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
    alert("Message added!");
     document.getElementById("message").value = ""; //clear the message field only 
     displayMessages() 
     } 
     
    catch (error) { 
      console.error("Failed to add message:", error);
       alert("Error adding message"); 
    } 
  });

displayMessages()