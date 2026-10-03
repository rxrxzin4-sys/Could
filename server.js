const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");
const app=express(), server=http.createServer(app), io=new Server(server);
app.use(express.static(path.join(__dirname,"public")));

const users=new Map();
io.on("connection",socket=>{
  socket.on("join",data=>{
    const user={id:socket.id,name:String(data.name||"Anônimo").slice(0,24),avatar:data.avatar||""};
    users.set(socket.id,user);
    socket.join("main");
    io.to("main").emit("users",[...users.values()]);
  });
  socket.on("message",text=>{
    const u=users.get(socket.id); if(!u)return;
    io.to("main").emit("message",{...u,text:String(text).slice(0,2000),time:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})});
  });
  socket.on("signal",data=>{
    if(data.to) io.to(data.to).emit("signal",{from:socket.id,data:data.data});
  });
  socket.on("call-state",state=>{
    const u=users.get(socket.id); if(!u)return;
    socket.broadcast.emit("call-state",{id:socket.id,...state});
  });
  socket.on("disconnect",()=>{
    users.delete(socket.id);
    io.to("main").emit("users",[...users.values()]);
  });
});
server.listen(process.env.PORT||3000,()=>console.log("Pulse Basic em http://localhost:"+(process.env.PORT||3000)));
