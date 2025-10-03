const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recape_facture', {
    etatrecape: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    organismerecape: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conventionrecape: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatrecours: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avecousansdate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    toutouparconv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    datedebut: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    datefin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    idrecape: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'recape_facture',
    schema: 'public',
    timestamps: false
  });
};
