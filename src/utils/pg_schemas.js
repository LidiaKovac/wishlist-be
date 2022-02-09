const { STRING, INTEGER, Model, ARRAY } = require("sequelize")



class Product extends Model {
    static initialize(sequelize) {
      this.init(
        {
          prod_id: {
            allowNull: false,
            primaryKey: true,
            type: STRING(100),
            unique: true,
          },
          name: {
            type: STRING(300),
            allowNull: false,
          },
          url: {
            type: STRING(300),
            allowNull: false,
          },
          images: {
            type: STRING(10000), //we are going to send the urls as a string and then separate them by comma
            allowNull: false
          }
        },
        {
          sequelize,
          timestamps: false,
          modelName: "Products",
        }
      );
    }
  }


module.exports = {Query, Product}