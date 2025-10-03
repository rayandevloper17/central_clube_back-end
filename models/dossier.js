const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dossier', {
    statu: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fax: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    telephone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nif: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mobil: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    capital: {
      type: DataTypes.REAL,
      allowNull: true
    },
    art: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rcs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatdudossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cheminlogo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddossier: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    idwilaya: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    wilaya: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    commune: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idcommune: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nombrechiffrecpc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    activite: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    articlefiscaaale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    aii: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rib: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dossier',
    schema: 'public',
    timestamps: false
  });
};
