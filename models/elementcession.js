const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementcession', {
    idelementcession: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    idimmo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valeurcompatble: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    idecriture: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    numinv: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateachat: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    valeurcession: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'elementcession',
    schema: 'public',
    timestamps: false
  });
};
