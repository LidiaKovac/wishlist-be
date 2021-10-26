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
          let product = await Product.findOne({ name: prod.split("/")[3] });
          //checks if product exists
          if (!product) {
            console.log("creating new prod");
            let newProd = await Product.create({ name: prod.split("/")[3], url: "http://" + prod, author: "6171d52268b69dc1059f2d55" });
            console.log("created", newProd);
          }
          if (detectedStore === "asos") {
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
            //https://cdn.aboutstatic.com/file/6712e6159b51d509930a05318f22fce0.jpg
            // let product = await Product.findOne({ name: prod.split("/")[3] });
            let JSONFromHTML = stringHTML.split('<script type="application/ld+json">')[2] //imageURL is here 
            let imageUrl = JSONFromHTML.split(`"image":["`)[1].split("?")[0] 
            
            res.send({ image: imageUrl, store: "About you", author: "6171d52268b69dc1059f2d55" });
            
          }
          if (detectedStore === "shein") {
            let meta = stringHTML.split('<meta property="og:image" content="');
            let imageLink = meta[1].split('">')[0].split(".jpg")[0]
            console.log(imageLink);
            //console.log(imageLink);
            res.status(200).send({ image: "https:" + imageLink.split(".jpg")[0] + ".jpg", store: "Shein", author: "6171d52268b69dc1059f2d55" });
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
