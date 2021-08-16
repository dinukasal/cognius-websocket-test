const io = require("socket.io-client")
const socket = io("ws://localhost:3004");

socket.on("connect", (con) => {
  // either with send()
  // socket.send("Hello!");

  // or with emit() and custom event names
  console.log(con, 'connected.....')
});

socket.emit("join", { "botId": "654654654646", sessionId: "21212121" });

// handle the event sent with socket.send()
socket.on("message", data => {
  console.log(data);
});

socket.on("joinAck", data => {
  console.log('join ack', data);
});

// handle the event sent with socket.emit()
socket.on("greetings", (elem1, elem2, elem3) => {
  console.log(elem1, elem2, elem3);
});