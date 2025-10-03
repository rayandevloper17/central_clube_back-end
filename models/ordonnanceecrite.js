const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ordonnanceecrite', {
    idordonnance: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dateord: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    titreordonnance: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    textmedicale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typeordnnce: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ordonnanceecrite',
    schema: 'public',
    timestamps: false
  });
};
