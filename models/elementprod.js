const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementprod', {
    idelementprod: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idpourc: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    pourcent: {
      type: DataTypes.REAL,
      allowNull: true
    },
    designationprod: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tmps: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phhh: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idtitre: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    C: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rotation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Repo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    be: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    controle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dillution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    poid: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'elementprod',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "elementprod_pkey",
        unique: true,
        fields: [
          { name: "idelementprod" },
        ]
      },
    ]
  });
};
