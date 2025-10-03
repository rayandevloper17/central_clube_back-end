const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('parametreroutanage', {
    IDtitre: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    titre: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeds: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idarticle: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'parametreroutanage',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "parametreroutanage_pkey",
        unique: true,
        fields: [
          { name: "IDtitre" },
        ]
      },
    ]
  });
};
