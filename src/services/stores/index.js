const store_route = require("express").Router();
const axios = require("axios");
const { Op } = require("sequelize");
const { Response, convertImages } = require("../../utils");
const { sequelize } = require("../../utils/db");
const { QueryTypes } = require('sequelize');
const { Query, Product } = require("../../utils/pg_schemas");

store_route.get(
  "/:q",
  /* checkLogged(), */ async (req, res, next) => {
    try {
      let passedQuery = req.params.q.toLowerCase()
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
      if(!passedQuery.includes(" ")) {
        passedQuery = passedQuery.slice(0, -1) //deletes last letter of query
      } else {
        // passedQuery = passedQuery.split(" ")[0].slice(0, -1) + " " + passedQuery.split(" ")[1];
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
              // { query: { [Op.substring]: passedQuery } },
              // { query: { [Op.like]: passedQuery } },
              { query: { [Op.startsWith]: passedQuery } },
              { query: {[Op.notRegexp]: "[\\s]"}},
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
      let clothes = []
      
      for(let query of qs) {
        
        const prod = await Product.findAll({
          where: {
            QueryQueryId: query.query_id
          },
          limit: 100,
          attributes: ['name', 'images', 'url', "prod_id"]
        })
        clothes = [...clothes, ...prod]
      }
      clothes = clothes.map(piece => {return {
        ...piece.dataValues, 
        images: convertImages(piece.images)
      }})
      res.status(201).send(clothes);

      
    } catch (e) {
      next(e);
    }
  }
);

module.exports = store_route;
