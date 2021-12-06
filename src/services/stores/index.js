const store_route = require("express").Router();
const axios = require("axios");
const { Op } = require("sequelize");
const { Response } = require("../../utils");
const { Query, Product } = require("../../utils/pg_schemas");

store_route.get(
  "/:q",
  /* checkLogged(), */ async (req, res, next) => {
    try {
      const passedQuery = req.params.q.toLowerCase();
      console.log(passedQuery);
      //check if query is similar to something already existing ✅
      //if it exists => return products in db
      //if it doesn't exist => scrape
      //check if the exact query exists
      //get the list of related queries
      const exactQ = await Query.findOne({
        //get exact query
        where: {
          query: passedQuery,
        },
      });
      if (!exactQ) {
        //if the exact query does not exist, create it
        let newQuery = await Query.create({
          query: passedQuery,
        });
        let {data} = await axios.get(process.env.SCRAPING_URL + "/" + req.params.q)
        let clothes = data.r 
        clothes.forEach(async piece => {
          await Product.create({name: piece.title, url: piece.url, images: piece.images.join(), QueryQueryId: newQuery.query_id})
        })
        //res.send(clothes)
      }
      const queries = await Query.findAll({
        //in any case, get the list of queries
        where: {
          [Op.or]: !passedQuery.includes(" ")
            ? [
                { query: { [Op.substring]: passedQuery } },
                { query: { [Op.like]: passedQuery } },
                { query: { [Op.startsWith]: passedQuery } },
                { query: passedQuery },
              ]
            : [
                { query: { [Op.substring]: passedQuery.split(" ")[0] } },
                { query: { [Op.like]: passedQuery.split(" ")[0] } },
                { query: { [Op.startsWith]: passedQuery.split(" ")[0] } },
                { query: passedQuery.split(" ")[0] },
              ],
        },
      });
      if (queries.length <= 0) {
        //if there are no similar queries, create one and get one
        await Query.create({
          query: passedQuery,
        });
      }
      const qs = await Query.findAll({
        //fetches updated list of queries, is there a way to avoid this?
        where: {
          [Op.or]: !passedQuery.includes(" ")
          ? [
              { query: { [Op.substring]: passedQuery } },
              { query: { [Op.like]: passedQuery } },
              { query: { [Op.startsWith]: passedQuery } },
              { query: passedQuery },
            ]
          : [
              { query: { [Op.substring]: passedQuery.split(" ")[0] } },
              { query: { [Op.like]: passedQuery.split(" ")[0] } },
              { query: { [Op.startsWith]: passedQuery.split(" ")[0] } },
              { query: passedQuery.split(" ")[0] },
            ],
      
        },
      });
      qs.forEach(async query => {
        const clothes = await Product.findAll({
          where: {
            QueryQueryId: query.query_id
          }
        })
        res.status(201).send(clothes);
      })

      
    } catch (e) {
      next(e);
    }
  }
);

module.exports = store_route;
