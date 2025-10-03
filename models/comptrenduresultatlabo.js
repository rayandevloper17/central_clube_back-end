const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comptrenduresultatlabo', {
    idcoompterendu: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idresultat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    compterenduttttt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'comptrenduresultatlabo',
    schema: 'public',
    timestamps: false
  });
};
