const store_route = require("express").Router();
const axios = require("axios");
const { Op } = require("sequelize");
const { Response, convertImages } = require("../../utils");
const { Query, Product } = require("../../utils/pg_schemas");

store_route.get("/scrape", async (req, res, next) => {
  try {
    let products = { totals: {}, pieces: [] };
    let stores = ["asos", "aboutyou", "shein", "hm", "subdued", "ovs"];
    for (const store of stores) {
      let { data } = await axios.get("http://127.0.0.1:5000/" + store + "/donna/1");
      products.totals[store] = Number(data.total);
      data.results.forEach(async(res) => {
        await Product.findCreateFind({where: {
          internal_id: res.internal_id,
          name: res.title,
          url: res.url,
          images: String(res.images)

        }})
      });
      let pages = Number(data.total.replaceAll(".", "")) / Number(data.results.length);
      console.log("⚙️    " + store + " has " + pages + "pages!");
      for (let i = 2; i < pages; i++) {
        console.log("⚙️    scraping page " + i);

        let { data } = await axios.get("http://127.0.0.1:5000/" + store + "/donna/" + i);
        data.results.forEach(async(res) => {
          await Product.findCreateFind({where: {
            internal_id: res.internal_id,
            name: res.title,
            url: res.url,
            images: String(res.images)

          }})
        });
      }
    }
    res.send("Done")
  } catch (error) {
    next(error);
  }
});

store_route.get(
  "/",
  /* checkLogged(), */ async (req, res, next) => {
    try {
      let { query, page } = req.query;
      let allProds = await Product.findAll({
        where: query
          ? {
              name: {
                  [Op.iLike]:  `%${query}%`,
              },
            }
          : {},
        limit: 30,
        offset: page ? (page - 1) * 30 : 0,
      });
      allProds.forEach((prod) => {
        prod.images = prod.images.replaceAll("wid=40", "wid=1000").split(",");
      });
      res.status(200).send({ products: allProds });
    } catch (e) {
      next(e);
    }
  }
);

store_route.get(
  "/:id",
  /* checkLogged(), */ async (req, res, next) => {
    try {
      let { id } = req.params;
      let {dataValues: prod} = await Product.findByPk(id);
      console.log(prod);
      let prodWithImages = {...prod, images: prod.images.replaceAll("wid=40", "wid=1000").split(",") }
      res.status(200).send(prodWithImages);
    } catch (e) {
      next(e);
    }
  }
);

store_route.delete("/:id", async (req, res, next) => {
  try {
    await Product.destroy({
      where: {
        internal_id: req.params.id,
      },
    });
    res.send("Done");
  } catch (error) {
    console.log(error);
  }
});

store_route.delete("/", async (req, res, next) => {
  try {
    await Product.destroy({
      where: {
        internal_id: {
          [Op.substring]: "",
        },
      },
    });
    res.send("Done");
  } catch (error) {
    console.log(error);
  }
});

module.exports = store_route;
