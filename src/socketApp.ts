import express from 'express';
const app = express();
import http from 'http';
import path from 'path';
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
import crypto from "crypto";


class User {
  public id : string;
  public name: string;
  public messages: string[] = [];
  public loggedDate: String;
  constructor(id: string, name: string){
    this.id = id;
    this.name = name;
    // when object generated the realtime
    this.loggedDate = (function(){const date = new Date(); return date.toLocaleString();})();
  }
  addMsg(msg: string):void{
    this.messages.push(msg);
  }
}

// join chat route
console.log(path.resolve('website', 'index.html'));
app.get('/', (req, res) => {
  //res.sendFile(path.resolve(__dirname + 'src', '..', 'website', 'index.html'));
  res.sendFile(path.resolve('website', 'index.html'));
});

app.get('/loginchat/:username/:color', (req, res) => {

  res.sendFile(path.resolve('website', 'index.html'));
  //session set uid
});

/*
socket.on('set nickname', function (name) {
  socket.nickname = name;
});
*/


const users : User[] = [];
io.on('connection', (socket) => {

  // this varables for each user alone so it reamins and hidden
  const userId: string =  crypto.randomBytes(16).toString("hex");
  const dumyName = 'user ' + users.length;
  const currentUser = new User(userId, dumyName);
  users.push(currentUser)
  console.log('Found User', users.find((user)=>{ return String(user.id) === userId}))
  console.log('a user connected');
  // send the user to client now both auth and regoinize user localy vars without session or cookies;
  io.emit('setuser', currentUser);

  socket.on('disconnect', ()=>{
    console.log(`${currentUser.name} disconnected`);
  });
  // event for send message (listen on send message event)
  socket.on('send message', (msg)=>{
    console.log(`${currentUser.name}: socket got the message ${msg}`);
    // send message to all include sender
    io.emit('send message', {sender: currentUser, msg: msg, date: new Date().toLocaleString()});
    // send message to all
    //socket.broadcast.emit('hi');
  });
  socket.on('typing', (user: string)=>{
    console.log('some one is typing gotten by client for now', user);
    io.emit('typing', user);
  })
  // user is user come from client and currentUser is the same user but from server
  socket.on('endedtyping', (user: User)=>{
    // if user.id != currentUser.id  secuirty issue
    io.emit('endedtyping', currentUser);
  });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});
