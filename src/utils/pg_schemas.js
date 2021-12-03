const { STRING, INTEGER, Model, ARRAY } = require("sequelize")

class Query extends Model {
  static initialize(sequelize) {
    this.init(
      {
        query_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: INTEGER,
          unique: true,
        },
        query: {
          type: STRING(50),
          allowNull: false,
        }
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Queries",
      }
    );
    
  }
}

class Product extends Model {
    static initialize(sequelize) {
      this.init(
        {
          prod_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: INTEGER,
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
          timestamps: true,
          modelName: "Products",
        }
      );
    }
  }


module.exports = {Query, Product}