const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('calculeimpot', {
    Code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    'Désignation': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Base: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Valeur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Refaction: {
      type: DataTypes.REAL,
      allowNull: false
    },
    cpc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idcalculeimpot: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cpc2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reffaction: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refactiontype: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valeurtype: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valeurtypeaff: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refactiontypeaff: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'calculeimpot',
    schema: 'public',
    timestamps: false
  });
};
