const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

const backendSocket = require('./socket/socket')

require("./db/mongoose");

const app = express();
const server = http.createServer(app);

app.use(express.json());
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

const loginRoutes = require("../src/router/loginRoutes");
const formRoutes = require("../src/router/formRoutes");
const responseRoutes = require("../src/router/responseRoutes");


app.use("/user", loginRoutes);
app.use("/form", formRoutes);
app.use("/response", responseRoutes);

// SOCKET
const io = socketio(server, { cors: corsOptions });
backendSocket(io)


const port = process.env.PORT || 3000;

server.listen(port, () => console.log("Server is listening at port", port));
