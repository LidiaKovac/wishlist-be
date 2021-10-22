const {mongoose, Schema, model} = require("mongoose")

const userSchema = new Schema({
    name: {
        type: String, 
        required: false
    },
    googleID: {
        type: String,
        required: true
    },
    propic: {
        type: String,
        required: false
    },
    favs: {
        type:Array,
        required: false
    }
})

module.exports = model("User", userSchema)