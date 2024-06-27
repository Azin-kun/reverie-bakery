'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
      });
    }
  }
  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    address: DataTypes.STRING,
    user_type: DataTypes.ENUM('customer', 'admin', 'owner')
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'User',
  });
  return User;
};
