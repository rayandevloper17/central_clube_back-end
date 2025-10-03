const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementconfigbilan', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idrubrique: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    coderubrique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatcpc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationcpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    colonne: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'elementconfigbilan',
    schema: 'public',
    timestamps: false
  });
};
