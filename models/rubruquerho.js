const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rubruquerho', {
    idrubrique: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CRUB: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    LRUB: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TYP: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NATRUB: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    FISC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SS: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PERIOD: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rubruquerho',
    schema: 'public',
    timestamps: false
  });
};
