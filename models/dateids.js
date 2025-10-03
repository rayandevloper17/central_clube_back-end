const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dateids', {
    iddateids: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datejrs: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ids: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatjrs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idservice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idsalle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codesale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idlit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codelit: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dateids',
    schema: 'public',
    timestamps: false
  });
};
