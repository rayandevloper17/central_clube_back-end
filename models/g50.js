const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('g50', {
    'periodicité': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    periode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateg50: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    identifiantfiscale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    articleimposition: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationdossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activite: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    montanttap: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montapcompte: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantirgsalaire: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantirgautre: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantibs: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montanttic: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantdroitettimbre: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantautre: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montanttva: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montanttotal: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    lieug50: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddossier: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ncheque: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatg50: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationg50: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codesection: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idperiode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    g50total: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    E3B94: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    E3B95: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    E3B96: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    E3B97: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    E3B98: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idg50: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'g50',
    schema: 'public',
    timestamps: false
  });
};
