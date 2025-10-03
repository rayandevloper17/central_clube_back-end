const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('configurationbilan', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    coderurbrique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationrubrique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'n-1': {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    typebilan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationtype: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'configurationbilan',
    schema: 'public',
    timestamps: false
  });
};
