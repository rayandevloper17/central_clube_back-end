const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('articlefournisseur', {
    idarticlefournisseur: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    caux: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationaux: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    delaisdelivraison: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    delaisroute: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    modepayement: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codearticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prixht: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'articlefournisseur',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "articlefournisseur_pkey",
        unique: true,
        fields: [
          { name: "idarticlefournisseur" },
        ]
      },
    ]
  });
};
