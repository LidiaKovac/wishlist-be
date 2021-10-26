const { ObjectId } = require("bson")
const {mongoose, Schema, model} = require("mongoose")

const productSchema = new Schema({
    name: {
        type: String, 
        required: false
    },
    author: {
        type: ObjectId,
        required: true
    },
    url: {
        type: String,
        required: false
    }
})

module.exports = model("Product", productSchema)