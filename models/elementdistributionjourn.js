const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementdistributionjourn', {
    idelementjourn: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iddistribgjourn: {
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
    desservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idarticle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codearticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationarticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qte: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'elementdistributionjourn',
    schema: 'public',
    timestamps: false
  });
};
