const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('servicemed', {
    idservice: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    etage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nbrchambre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nbrlit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nbrblock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nbrsaletravai: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nbrlitrea: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    respensableservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'servicemed',
    schema: 'public',
    timestamps: false
  });
};
