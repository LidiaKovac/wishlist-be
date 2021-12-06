require("dotenv").config();
const Sequelize = require("sequelize");
const { Query, Product } = require("./pg_schemas");
const {DATABASE_URL} = process.env

const sequelize = new Sequelize(DATABASE_URL, {
	logging: false,
	dialect: "postgres",
	dialectOptions: {
		ssl: {
			required: true,
			rejectUnauthorized: false,
		},
	},
})
sequelize.authenticate()

let models = [Query, Product]
models.forEach((model) => {
	model.initialize(sequelize)
})

Query.hasMany(Product)
Product.belongsToMany(Query, {through: "ProdQuery"})

module.exports = {sequelize};
