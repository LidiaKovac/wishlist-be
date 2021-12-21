//libs
const express = require("express");
const cors = require("cors");
const endpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const session = require("express-session")
const passport = require("passport");
//routes
const user_route = require("./services/user");
const store_route = require("./services/stores");
//dbs
const db = require("./utils/db");
//configs
require("dotenv").config();
require("./utils/passport")(); //runs passport

const { PORT, MONGO_DB, SQL_URI } = process.env;
const server = express();

server.use(
  cors(
    { credentials: true, exposedHeaders: ["set-cookie"], origin:[new URL("http://localhost:3000/"), new URL("http://localhost:3001/")]  }
    //   {
    //   origin: [new URL("http://localhost:3000/"), new URL("http://localhost:3001/")],
    // }
  )
);
server.options('*', cors({ credentials: true, exposedHeaders: ["set-cookie"], origin:[new URL("http://localhost:3000/"), new URL("http://localhost:3001/")] }))
//   {
//     origin: [new URL("http://localhost:3000/"), new URL("http://localhost:3001/")]
//   }
// ))
server.use(session({
  cookie: {
      path: "/",
      secure: true,
      //domain: ".herokuapp.com", REMOVE THIS HELPED ME (I dont use a domain anymore)
      httpOnly: true
  }
}));
server.use(express.json());
server.use(passport.initialize());

server.use("/api/user", user_route);
server.use("/api/store", store_route);

//user connection
mongoose
  .connect(MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🌚 The server has successfully connected to mongodb."))
  //products connection
  .then(() => db.sequelize.sync({ force: false }))
  .then(() => console.log("🌝 The server has successfully connected to postgres."))
  .then(() => {
    server.listen(PORT, () => {
      console.log("🌚 Server has started on port " + PORT + "!" + " \n🌝 The server has these endpoints: \n");
      console.table(endpoints(server));
    });
  })
  .catch((e) => {
    console.log("❌ CONNECTION FAILED! Error: ", e);
  });

module.exports = server;
