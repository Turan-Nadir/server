const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, { cors: {
		origin: "https://face.glasscube.io",
		methods: [ "GET", "POST" ]
	} });
io.on("connection", (socket) => {
	socket.emit("me", socket.id);
	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});
	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	});
	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
	socket.on("endCall", (data) => {
		io.to(data.to).emit("callEnded");
	});
});
server.listen(3003, () => console.log("server is running on port 3003"))