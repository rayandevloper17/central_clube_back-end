const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('balance', {
    idbalance: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    designationcompte: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    debit0: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit0: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit1: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit2: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit3: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit3: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit4: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit4: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit5: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit5: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit6: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit6: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit7: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit7: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit8: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit8: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit9: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit9: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit10: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit10: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit11: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit11: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit12: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit12: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CAUX: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'balance',
    schema: 'public',
    timestamps: false
  });
};
