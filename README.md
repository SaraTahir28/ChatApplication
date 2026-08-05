# 📱 ChatApplication

A lightweight, full‑stack chat application supporting **Long‑Polling** and **WebSockets**, built with clean architecture and a simple, readable UI.

Hosted on Coolify:

- **Frontend:** (https://saratahir-chatapp-frontend.grads.hosting.cyf.academy)
- **Backend:** (https://saratahir-chatapp-backend.grads.hosting.cyf.academy)

This project demonstrates two real‑time communication strategies side‑by‑side, making it ideal for learning, teaching, or comparing transport layers.

---

## 🚀 Features

### **Frontend**
- Pure **HTML, CSS, and JavaScript** (no frameworks)  
- Two real‑time communication modes:
  - **Long‑Polling**
  - **WebSockets**
- Clean, responsive UI  
- Distinct message bubbles for sender/receiver  
- Shared logic extracted into `common.js`  

### **Backend**
- **Node.js + Express**
- Long‑Polling implementation with request queueing  
- WebSocket server using `ws`  
- Shared in‑memory message store for both transports  

---

## 🧱 Project Structure

```text
ChatApplication/
│
├── Backend/
│   ├── backend.js
│   ├── package.json
│   └── package-lock.json
│
├── Frontend/
│   ├── index.html
│   ├── landing.html
│   ├── longpolling.html
│   ├── websocket.html
│   ├── longpoll.js
│   ├── websocket.js
│   ├── common.js
│   └── style.css
│
└── README.md
```

---

## 📡 Transport Layer Overview

### **Long‑Polling**
- Client sends a request  
- Server holds it open until a new message arrives  
- Client immediately sends another request  
- Simple but less efficient  

### **WebSockets**
- Persistent connection  
- Server pushes messages instantly  
- More efficient and scalable  

Both modes share the same message store, so they stay in sync.
