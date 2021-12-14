const passport = require("passport");
const User = require("./schema");
const user_route = require("express").Router();
const { Product } = require("../../utils/pg_schemas");
const { convertImages } = require("../../utils/index");

user_route.get("/google", passport.authenticate("google", { scope: ["profile"] }));

user_route.get("/callback", passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }), async (req, res, next) => {
  try {
    res.cookie("USER_id", req.user.id, {
      maxAge: 172800000,
    });
    //cookies expires in two days
    res.redirect("http://localhost:3000/");
  } catch (error) {
    next(error);
  }
});

user_route.get("/me", async (req, res, next) => {
  try {
    
    let user = await User.findById(req.query.id);
    
    res.send(user);
  } catch (error) {
    next(error);
  }
});

user_route.put("/favs", async (req, res, next) => {
  // /favs?action=add&id=USER_ID from cookies
  try {
    if (req.query.id && req.query.action) {
      //only if logged in
      let user = await User.findById(req.query.id);
      if (req.query.action === "add") {
        user.favs = [...user.favs, req.body.prod_id];
      } else {
        user.favs = user.favs.filter((fav) => fav !== req.body.prod_id);
      }
      await user.save();
      res.send(user);
    } else res.send({ message: "id and action are both mandatory queries" });
  } catch (error) {
    next(error);
  }
});

user_route.get("/favs", async (req, res, next) => {
  // /favs?id=USER_ID
  try {
    if (req.query.id) {
      let { favs } = await User.findById(req.query.id);

      let promiseArray = favs.map((fav) => {
        return Product.findOne({
          where: {
            prod_id: fav,
          },
          attributes: ["prod_id", "name", "url", "images"],
        });
      });

      let populatedFavs = await Promise.all(promiseArray);
      populatedFavs = populatedFavs.map((fav) => {
        return {
          ...fav.dataValues,
          images: convertImages(fav.images),
        };
      });

      populatedFavs ? res.status(200).send({ favs: populatedFavs }) : res.status(404).send({ message: "user not found or favs not found" });
    } else res.send({ message: "id is a required query" });
  } catch (error) {
    next(error);
  }
});

module.exports = user_route;
