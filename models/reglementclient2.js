const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reglementclient2', {
    typepayeent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    npiecefinanciere: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeclient: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationclient: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationpayeur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    montantpayer: {
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
    datereglement: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    iddoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idcaisse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clientfourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddocexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idregleentclient: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatreglement: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reglementclient2',
    schema: 'public',
    timestamps: false
  });
};
