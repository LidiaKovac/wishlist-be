const passport = require("passport");
const User = require("./schema")
const user_route = require("express").Router();

user_route.get("/google", passport.authenticate("google", { scope: ["profile"] }));

user_route.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }),
  async (req, res, next) => {
    try {
      res.cookie("USER_id", req.user.id, {
        maxAge: 172800000,
      });
      //cookies expires in two days
      res.redirect("http://localhost:3000/");
    } catch (error) {
      next(error);
    }
  }
);

user_route.get("/me", async(req,res,next)=> {
  try {
    console.log(req.query.id);
    let user = await User.findById(req.query.id)
    console.log(user);
    res.send(user)
  } catch (error) {
    next(error)
  }
})

user_route.put("/favs", async(req,res,next) => { // /favs?action=add&id=USER_ID from cookies
  try {
    if(req.query.id) { //only if logged in
      if(req.query.action === "add") {
        let user = await User.findById(req.query.id)
        user.favs = [...user.favs, req.body.prod_id]
        await user.save()
        res.send(user)
      }
      else {
  
      }
    } else res.status(401)
    
  } catch (error) {
    next(error)
  }
})


module.exports = user_route;
