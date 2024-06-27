'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
      Order.hasMany(models.OrderDetail, {
        foreignKey: 'order_id'
      });
    }
  }
  Order.init({
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    order_date: DataTypes.DATE,
    total_amount: DataTypes.DECIMAL,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Order',
  });
  return Order;
};
