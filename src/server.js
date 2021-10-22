const express = require("express");
const cors = require("cors");
const endpoints = require("express-list-endpoints");
const mongoose = require("mongoose");

const user_route = require("./services/user");
const store_route = require("./services/stores");
const passport = require("passport");

require("dotenv").config();
require("./utils")() //runs passport 


const { PORT, MONGO_DB } = process.env;
const server = express();

server.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
server.use(express.json());
server.use(passport.initialize())


server.use("/api/user", user_route);
server.use("/api/store", store_route);

mongoose.connect(MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
  server.listen(PORT, () => {
    console.log("🌚 The server has successfully connected to mongodb.")
    console.log(
      "🌝 Server has started on port " +
        PORT + "!" +
        " \n🌚 The server has these endpoints: \n"
    );
    console.table(endpoints(server));
  });
}).catch(err => {
    throw err
})

module.exports = server;
