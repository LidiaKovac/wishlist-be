const passport = require("passport")

const user_route = require("express").Router()


user_route.get("/google", passport.authenticate("google", {scope: ['profile']}))

user_route.get("/callback", passport.authenticate("google", { failureRedirect: 'http://localhost:3000/login' }), async(req,res,next)=> {
    try {
        res.cookie('USER_id', req.user.id, {
           maxAge: 172800000 
        })
        //cookies expires in two days
        res.redirect("http://localhost:3000/home")
    } catch (error) {
       next(error);
    }
})
module.exports = user_route