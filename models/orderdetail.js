'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(models) {
      // define association here
      OrderDetail.belongsTo(models.Order, {
        foreignKey: 'order_id'
      });
      OrderDetail.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
    }
  }
  OrderDetail.init({
    orderdetail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderDetail',
    tableName: 'OrderDetail',
  });
  return OrderDetail;
};
