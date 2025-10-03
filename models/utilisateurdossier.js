const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('utilisateurdossier', {
    idutilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    profil: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'utilisateurdossier',
    schema: 'public',
    timestamps: false
  });
};
