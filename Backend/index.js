//     import express from 'express'
//     import http from 'http'
//     import { Socket } from 'net';
//     import { Server } from 'socket.io';
//     import path from 'path';

//     const app=express();

//     const server=http.createServer(app);

//     const io=new Server(server,{
//         cors:{
//             origin:"*",
//         },
//     });


//     const rooms=new Map();

//     io.on("connection",(socket)=>{
//         // console.log("User connected",socket.id);
//         let currentRoom=null;
//         let currentUser=null;

//         socket.on("join",({roomId,userName})=>{
//             if(currentRoom){
//                 socket.leave(currentRoom)
//                 rooms.get(currentRoom).delete(currentUser)
//                 io.to(currentRoom).emit("user joined",Array.from(rooms.get(currentRoom)));

//             }

//             currentRoom=roomId;
//             currentUser=userName;

//             socket.join(roomId);
//             if(!rooms.has(roomId)){
//                 rooms.set(roomId,new Set());
//             }

//             rooms.get(roomId).add(userName)

//             io.to(roomId).emit("userJoined",Array.from(rooms.get(currentRoom)));
        
//         });

//         socket.on("codeChange",({roomId,code})=>{
//             socket.to(roomId).emit("codeUpdate",code)
//         });

//         //leaveroom

//         socket.on("leaveRoom",()=>{
//             if(currentRoom && currentUser){
//                 rooms.get(currentRoom).delete(currentUser)
//                 io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom)));
//             }

//             socket.leave(currentRoom);
//             currentRoom=null;
//             currentUser=null;
//         });

//         //typing indicator

//         socket.on("typing",({roomId,userName})=>{
//             socket.to(roomId).emit("usertyping",userName);
//         })

//         //language change

//         socket.on("languageChange",({roomId,language})=>{
//             socket.to(roomId).emit("languageUpdate",language);
//         })

//         //disconnect reload

//         socket.on("disconnect",()=>{
//             if(currentRoom && currentUser){
//                 rooms.get(currentRoom).delete(currentUser)
//                 io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom)));
//             }
//             // console.log("User Disconnected")
//         })
//     });


//     const port=process.env.PORT || 5000;

//     // const __dirname=path.resolve()

//     // app.use(express.static(path.join(__dirname,"../Frontend/dist")))

//     // app.get("*",(req,res)=>{
//     //     res.sendFile(path.join(__dirname,"../Frontend/dist/index.html"))
//     // })
// app.get("/", (req, res) => {
//   res.send("Backend API is running...");
// });

//     server.listen(port,()=>{
//         console.log('server is working on port 5000');
//     });




import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit(
        "userJoined",
        Array.from(rooms.get(currentRoom) || [])
      );
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit(
        "userJoined",
        Array.from(rooms.get(currentRoom) || [])
      );
    }

    socket.leave(currentRoom);
    currentRoom = null;
    currentUser = null;
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("usertyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    socket.to(roomId).emit("languageUpdate", language);
  });

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit(
        "userJoined",
        Array.from(rooms.get(currentRoom) || [])
      );
    }
  });
});

// ---------- Serve Frontend (Vite build) ---------- //
const frontendPath = path.join(__dirname, "../Frontend/dist");

app.use(express.static(frontendPath));

// ✅ Express v5 compatible catch-all
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ------------------------------------------------- //

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
