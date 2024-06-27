'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // define association here
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
      });
    }
  }
  Category.init({
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Category',
  });
  return Category;
};
