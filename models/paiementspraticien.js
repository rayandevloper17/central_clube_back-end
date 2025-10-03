const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paiementspraticien', {
    idpaiement: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    codeact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codepraticien: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nompraticien: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenompractien: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prixact: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idacttds: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'paiementspraticien',
    schema: 'public',
    timestamps: false
  });
};
