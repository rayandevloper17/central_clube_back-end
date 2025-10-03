const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exercice', {
    datedebut: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    datefin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clotureex: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idexercicepreced: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idexerciceprochain: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idexercice: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'exercice',
    schema: 'public',
    timestamps: false
  });
};
