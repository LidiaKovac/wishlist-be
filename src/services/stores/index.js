const store_route = require("express").Router()



store_route.get("/", (req,res) => {
    try {
        //the URL in the query needs to start with the store name, https, www and language extension should be deleted
        //ex: http://localhost:3001/api?=aboutyou.it/p/ugg/boots-da-neve-classic-mini-ii-7201922 
        const prod = req._parsedUrl.query.split("=")[1]
        console.log(prod);
        let detectedStore = prod.split(".")[0]
        console.log(detectedStore);
        request("https://www." + prod, (err, suc, html) => {
            if (!err && html) {
                res.send({data: html, detectedStore});
            }
                     if (err) {
                        console.log(err);
                     }
                 })
        // const store = req._parsedUrl.query.split("&")[1].split("=")[1]
        // if (store === "aboutyou") {
        //     request("https://www.aboutyou.it/p/" + prod, (err, suc, html) => {
        //         res.send({data: html});
        //     })
        // if (store==="shein") {
        //     //https://it.shein.com/Letter-Graphic-Colorblock-Drop-Shoulder-Button-Front-Sweatshirt-p-2865873-cat-1773.html?scici=WomenHomePage~~ON_Banner,CN_cate1018,HZ_4,HI_hotZonee3tez396gt4~~6_4~~real_1773~~~~
        //     request("https://it.shein.com/" + prod, (err, suc, html) => {
        //         res.send({data: html});
        //     })
        // }
        // }
    } catch (error) {
        console.log(error);
        
    }
})

module.exports = store_route
