const store_route = require("express").Router();
const axios = require("axios");
const { Op } = require("sequelize");
const { Response, convertImages } = require("../../utils");
const { Query, Product } = require("../../utils/pg_schemas");

store_route.get("/crono", async (req, res, next) => {
  try {
    let products = { totals: {}, pieces: [] };
    let stores = ["asos", "aboutyou", "shein", "hm", "subdued", "ovs"];
    let allProds = await Product.findAll();
    let db_ids = allProds.map((p) => p.id);
    for (const store of stores) {
      let { data } = await axios.get(process.env.SCRAPING_URL + "/" + store + "/donna/1");
      products.totals[store] = Number(data.total);
      data.results.forEach((res) => {
        if (!db_ids.includes(res.id)) {
          products.pieces.push(res);
        }
      });
      // console.log(products);
      let pages = Number(data.total.replaceAll(".", '')) / Number(data.results.length);
      console.log("⚙️" + store + "has " + pages + "pages!");
      for (let i = 2; i < pages; i++) {
        console.log("⚙️" + "scraping page " + i);

        let { data } = await axios.get(process.env.SCRAPING_URL + "/" + store + "/donna/" + i);
        data.results.forEach((res) => {
          if (!db_ids.includes(res.id)) {
            products.pieces.push(res);
          }
        });
      }
    }
    for (const prod of products.pieces) {
     
      await Product.create({ internal_id: prod.id, name: prod.title, images: prod.images.join(), url: prod.url });
    }

    res.send(products.pieces);
  } catch (error) {
    next(error);
  }
});

store_route.get(
  "/",
  /* checkLogged(), */ async (req, res, next) => {
    try {
      let allProds = await Product.findAll();

      res.status(200).send({products: allProds});
    } catch (e) {
      next(e);
    }
  }
);

module.exports = store_route;
