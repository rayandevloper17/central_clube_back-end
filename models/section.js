const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('section', {
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ai: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idstructfiscsoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idstructfiscsocr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idstructfiscsoccnas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    banque: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rib: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codese: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adressesect: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Nsecuritesocial: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typesects: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    salle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    resp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idsection: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    wilaya: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idinspectionimpot: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idacnas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idrimpot: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idwilaya: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'section',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "section_pkey",
        unique: true,
        fields: [
          { name: "idsection" },
        ]
      },
    ]
  });
};
