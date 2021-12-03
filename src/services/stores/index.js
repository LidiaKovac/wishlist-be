const store_route = require("express").Router();
const axios = require("axios");
const Product = require("./schema");

store_route.get(
  "/:q",
  /* checkLogged(), */ async (req, res, next) => {
    try {
      axios.get(process.env.SCRAPING_URL + "/" + req.params.q).then(results => res.send(results.data))
    } catch (e) {
      next(e)
    }
  }
);

module.exports = store_route;
