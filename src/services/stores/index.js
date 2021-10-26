const store_route = require("express").Router();
const axios = require("axios");
const Product = require("./schema");

store_route.get(
  "/",
  /* checkLogged(), */ async (req, res, next) => {
    //gives back store, html and
    try {
      //the URL in the query needs to start with the store name, https, www and language extension should be deleted
      //ex: http://localhost:3001/api?=aboutyou.it/p/ugg/boots-da-neve-classic-mini-ii-7201922
      const prod = req._parsedUrl.query.split("=")[1];
      console.log(prod);
      let detectedStore = prod.split(".")[0];
      console.log(detectedStore);
      //CHECK IF PROD ALREADY EXISTS
      axios
        .get("https://www." + prod)
        .then(async (page) => {
          let stringHTML = page.data;
          if (detectedStore === "asos") {
            let product = await Product.findOne({ name: prod.split("/")[3] });
            if (!product) {
              console.log("creating new prod");
              let newProd = await Product.create({ name: prod.split("/")[3], url: "http://" + prod, author: "6171d52268b69dc1059f2d55" });
              console.log("created", newProd);
            }
            const baseUrl = "https://images.asos-media.com/products/";
            //     console.log(url);
            console.log(prod);
            let prodInfo = prod?.split("?clr")[0] || prod?.split("?")[0];
            console.log(prodInfo);
            let prodUrl = prodInfo.split("/");
            console.log(prodUrl);
            let finalUrl = baseUrl + prodUrl[3] + "/" + (prodUrl[5].includes("?") ? prodUrl[5].split("?")[0] : prodUrl[5]) + "-2";
            res.send({ image: finalUrl, store: "Asos" });
          }
          if (detectedStore === "aboutyou") {
            //aboutyou.it/p/max-co/abito-camicia-tritare-7041743
            let product = await Product.findOne({ name: prod.split("/")[3] });
            if (product) {
              let trim = stringHTML.split('<script type="application/ld+json">');
              //console.log(trim[2]);
              let imgArr = trim[2].split('"image":["');
              //console.log(imgArr[1]);
              let img = imgArr[1].split('","');
              //console.log(img[0]);
              res.send({ image: img, store: "About you" });
            }
          }
          if (detectedStore === "shein") {
            let meta = stringHTML.split('<meta property="og:image" content="');
            let imageLink = meta[1].split('">')[0];
            //console.log(imageLink);
            res.status(200).send({ image: "https://" + imageLink, store: "Shein" });
          }
          if (detectedStore !== "shein" && detectedStore !== "aboutyou" && detectedStore !== "asos") {
            throw "Store does not exist";
          }
        })
        .catch((err) => next(err));
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = store_route;
