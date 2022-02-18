//libs
const express = require("express");
const cors = require("cors");
const endpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const cron = require("node-cron")

const passport = require("passport");
//routes
const user_route = require("./services/user");
const store_route = require("./services/stores");
//dbs 
const db = require("./utils/db");
const axios = require("axios");
const { scheduleJob } = require("node-schedule");
//configs
require("dotenv").config();
require("./utils/passport")(); //runs passport


const { PORT, MONGO_DB, SQL_URI } = process.env;
const server = express();

server.use(
  cors(
  //   {
  //   origin: [new URL("http://localhost:3000/"), new URL("http://localhost:3001/")],
  // }
  )
);
// server.options('*', cors(
//   {
//     origin: [new URL("http://localhost:3000/"), new URL("http://localhost:3001/")]
//   }
// ))
server.use(express.json());
server.use(passport.initialize());

server.use("/api/user", user_route);
server.use("/api/store", store_route);

console.log(cron.validate('* * * * *'))
/* scheduleJob('* * * * *', ()=> {
  axios.get("http://localhost:3001/api/store").then(({data})=> console.log(data)).catch(e => console.log(e))
}) */

scheduleJob('0 0 7,14 * *', ()=> {
  //on the 7th and onthe 14th of each month
  axios.get(process.env.BE_URI + "/api/store/crono").then(({data})=> console.log("🎉 Updated!")).catch(e => console.log(e))
 })

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
