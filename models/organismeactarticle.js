const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('organismeactarticle', {
    idproduit: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    codeorganisme: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeproduit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationproduit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prixproduit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    actorart: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'organismeactarticle',
    schema: 'public',
    timestamps: false
  });
};
