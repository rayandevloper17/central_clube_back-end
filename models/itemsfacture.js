const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('itemsfacture', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nomitem: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    codeitem: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'itemsfacture',
    schema: 'public',
    timestamps: false
  });
};
