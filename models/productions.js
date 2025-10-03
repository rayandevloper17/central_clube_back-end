const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productions', {
    idprodu: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    typeprod: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    designationproduit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    QuantiteKG: {
      type: DataTypes.REAL,
      allowNull: true
    },
    QuantiteNombre: {
      type: DataTypes.REAL,
      allowNull: true
    },
    dateprod: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    referenceprod: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    codeproduit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referenceroutrannage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatrouttanage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    epesseur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    choix: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'productions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "productions_pkey",
        unique: true,
        fields: [
          { name: "idprodu" },
        ]
      },
    ]
  });
};
