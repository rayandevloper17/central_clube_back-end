const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('finnissagepourcentage', {
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
    idroutpourc: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'finnissagepourcentage',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "finnissagepourcentage_pkey",
        unique: true,
        fields: [
          { name: "idroutpourc" },
        ]
      },
    ]
  });
};
