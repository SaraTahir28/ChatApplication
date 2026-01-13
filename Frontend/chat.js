const container = document.getElementById("messages")
async function displayMessages(){
  try{
  const response = await fetch("http://localhost:3000/messages") //talking to backend with a GET request, which only sends back data.
  const data = await response.json() //expecting data to be sent as structured JSON. 
  container.innerHTML=""
    for(const i of data){
        const list = document.createElement("li")
            list.textContent = `${i.user}: ${i.message}`;
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
  //Adding Validation to check both author and quote are added
  if (!message.trim() || !user.trim()) 
    { alert("Both message and user are required."); return;
    }
  try { 
    const response = await fetch("http://localhost:3000/messages", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ user, message }) 
      }); 
    const text = await response.text(); 
    console.log("Server response:", text); 
  //show backend error message to user 
  if(!response.ok){
    alert("Error: " + text);
  }
    alert("Message added!");
     e.target.reset(); // clears the form
     displayMessages() 
     } 
     
    catch (error) { 
      console.error("Failed to add message:", error);
       alert("Error adding message"); 
    } 
  });

displayMessages()