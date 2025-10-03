const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('completementjourneau', {
    idcomptlementjourn: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codejournal: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cpc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'completementjourneau',
    schema: 'public',
    timestamps: false
  });
};
