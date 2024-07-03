const express = require("express");
const { addUser, removeUser, getUser, getAllUsers } = require('./utils/user');
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

//routes
app.get("/", (req, res) => {
    res.send("This is skribble server");
});

const rooms = {};  // Store room-specific data



io.on("connection", (socket) => {
    socket.on("userJoined", (data) => {
        const { name, roomid, userId, host, presenter, points } = data;

        if (!getUser(userId)) {

            const users = addUser({ name, roomid, userId, host, presenter,points, socketId: socket.id });
            socket.join(roomid);

            // Initialize room data if not already present
            if (!rooms[roomid]) {
                rooms[roomid] = { imgURL: '', users: [] };
            }

            rooms[roomid].users = users;
            socket.emit("userIsJoined", { success: true, users });
            socket.broadcast.to(roomid).emit("userIsJoinedMessage", name);
            io.to(roomid).emit("allUsers", users); // Use io.to(roomid) to emit to the whole room
            socket.emit("whiteboardDataResponse", {
                imgURL: rooms[roomid].imgURL,
            });
        } else {
            socket.emit("userIsJoined", { success: false, message: "User already in the room" });
        }
    });

    socket.on("whiteboardData", (data) => {
        const user = getUser(socket.id);
        if (user && rooms[user.roomid]) {
            rooms[user.roomid].imgURL = data;
            socket.broadcast.to(user.roomid).emit("whiteboardDataResponse", {
                imgURL: data,
            });
        }
    });

    socket.on("message",(data)=>{
        const user = getUser(socket.id);
        const {message}=data;
        socket.broadcast.to(user.roomid).emit("messageResponse",{message, name:user.name, userId:user.userId, points:user.points});
    });

    socket.on("chooseWord", (data)=>{
        const user = getUser(socket.id);
        io.to(user.roomid).emit("sendWord",data);
    });

    socket.on("wordIsGuessed",(data)=>{
        const user = getUser(socket.id);
        io.to(user.roomid).emit("wordGuessedResponse",data);
    });

    socket.on("changePresenter",(data)=>{
        const user1 = getUser(socket.id);
        const users1= getAllUsers(user1.roomid);
        const currentPresenter=data.currentPresenter;
        const nextPresenter=data.nextPresenter;
        io.to(user1.roomid).emit("changePresenterResponse", {user1, users1, currentPresenter, nextPresenter});
    });

    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if (user) {
            const updatedUsers = removeUser(socket.id);
            if (rooms[user.roomid]) {
                rooms[user.roomid].users = updatedUsers;
                socket.broadcast.to(user.roomid).emit("userLeftMessage", user.name);
                io.to(user.roomid).emit("allUsers", updatedUsers); // Use io.to(roomid) to emit to the whole room
            }
        }
    });
});


/*

let roomidGlobal, imgURLGlobal;

io.on("connection", (socket) => {
    socket.on("userJoined", (data) => {
        const { name, roomid, userId, host, presenter } = data;
        roomidGlobal = roomid;
        socket.join(roomid);
        const users = addUser({ name, roomid, userId, host, presenter, socketId:socket.id });
        socket.emit("userIsJoined", { success: true, users});
        socket.broadcast.to(roomid).emit("userIsJoinedMessage", name);
        socket.broadcast.to(roomid).emit("allUsers", users);
        socket.broadcast.to(roomid).emit("whiteboardDataResponse", {
            imgURL: imgURLGlobal,
        });
    });

    socket.on("whiteboardData", (data) => {
        imgURLGlobal = data;
        socket.broadcast.to(roomidGlobal).emit("whiteboardDataResponse", {
            imgURL: data,
        });
    });

    socket.on("disconnect", () => {
        const user=getUser(socket.id);
        if (user){
            const usrs=removeUser(socket.id);
            socket.broadcast.to(roomidGlobal).emit("userLeftMessage", user.name);
            socket.broadcast.to(roomidGlobal).emit("allUsers", usrs);
            
        }
        
    });

    
});

*/

const port = process.env.PORT || 5000;

server.listen(port, () =>
    console.log("server is running on http://localhost:5000")
);