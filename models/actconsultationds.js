const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('actconsultationds', {
    idactconsultationds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    montantglobal: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantclinique: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tva: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantttc: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rubriquefact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codepraticien: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etaaatt: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'actconsultationds',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "actconsultationds_pkey",
        unique: true,
        fields: [
          { name: "idactconsultationds" },
        ]
      },
    ]
  });
};
