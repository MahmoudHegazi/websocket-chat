"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
var http_1 = __importDefault(require("http"));
var path_1 = __importDefault(require("path"));
var server = http_1.default.createServer(app);
var socket_io_1 = require("socket.io");
var io = new socket_io_1.Server(server);
var crypto_1 = __importDefault(require("crypto"));
var User = /** @class */ (function () {
    function User(id, name) {
        this.messages = [];
        this.id = id;
        this.name = name;
        // when object generated the realtime
        this.loggedDate = (function () { var date = new Date(); return date.toLocaleString(); })();
    }
    User.prototype.addMsg = function (msg) {
        this.messages.push(msg);
    };
    return User;
}());
var uname = '';
var color = '';
console.log(path_1.default.resolve('website', 'index.html'));
app.get('/', function (req, res) {
    //res.sendFile(path.resolve(__dirname + 'src', '..', 'website', 'index.html'));
    res.sendFile(path_1.default.resolve('website', 'index.html'));
});
app.get('/loginchat/:username/:color', function (req, res) {
    res.sendFile(path_1.default.resolve('website', 'index.html'));
    //session set uid
});
/*
socket.on('set nickname', function (name) {
  socket.nickname = name;
});
*/
var users = [];
io.on('connection', function (socket) {
    // this varables for each user alone so it reamins and hidden
    var userId = crypto_1.default.randomBytes(16).toString("hex");
    var dumyName = 'user ' + users.length;
    var currentUser = new User(userId, dumyName);
    users.push(currentUser);
    console.log('Found User', users.find(function (user) { return String(user.id) === userId; }));
    console.log('a user connected');
    // send the user to client now both auth and regoinize user localy vars without session or cookies;
    io.emit('setuser', currentUser);
    socket.on('disconnect', function () {
        console.log("".concat(currentUser.name, " disconnected"));
    });
    // event for send message (listen on send message event)
    socket.on('send message', function (msg) {
        console.log("".concat(currentUser.name, ": socket got the message ").concat(msg));
        // send message to all include sender
        io.emit('send message', { sender: currentUser, msg: msg, date: new Date().toLocaleString() });
        // send message to all
        //socket.broadcast.emit('hi');
    });
    socket.on('typing', function (user) {
        console.log('some one is typing gotten by client for now', user);
        io.emit('typing', user);
    });
    // user is user come from client and currentUser is the same user but from server
    socket.on('endedtyping', function (user) {
        // if user.id != currentUser.id  secuirty issue
        io.emit('endedtyping', currentUser);
    });
});
server.listen(3000, function () {
    console.log('listening on *:3000');
});
