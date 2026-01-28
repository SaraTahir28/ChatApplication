

document.getElementById("message-form").addEventListener("submit",async(e)=>{
  e.preventDefault() //prevents page from refreshing on form submission
 await handleFormSubmit(async(formData)=>{
  await fetch(`${API_URL}/messages`,{
    method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify(formData)
  })
 })
})
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

longPoll();