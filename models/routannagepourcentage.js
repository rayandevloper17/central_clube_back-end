const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('routannagepourcentage', {
    idroutpourc: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idparmpourc: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pourcent: {
      type: DataTypes.REAL,
      allowNull: true
    },
    designationparmrout: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idarticles: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    typeparprod: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tmps: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phhh: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rotation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ropos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    be: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'contrôle': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dilution: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'routannagepourcentage',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "routannagepourcentage_pkey",
        unique: true,
        fields: [
          { name: "idroutpourc" },
        ]
      },
    ]
  });
};
