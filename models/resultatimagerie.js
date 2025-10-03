const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('resultatimagerie', {
    idimagerie: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idimagerieact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lienimageact: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'resultatimagerie',
    schema: 'public',
    timestamps: false
  });
};
