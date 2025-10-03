const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('distribjournalier', {
    iddistribgjourn: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datedistrib: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typeartcle: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'distribjournalier',
    schema: 'public',
    timestamps: false
  });
};
