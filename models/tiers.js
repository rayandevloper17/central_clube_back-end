const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiers', {
    CAUX: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    LAUX: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    STAT: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CUSER: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MAIL: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    RUE: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CVILLE: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NIS: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typtiers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    INCID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TELFIX: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TELMOB: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    FAX: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    AI: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NIF: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    RC: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cnr: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    REMISE: {
      type: DataTypes.REAL,
      allowNull: true
    },
    cpc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    regimefiscal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    debit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debit_ant: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    credit_ant: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    typedutiers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idtiers: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    idwilaya: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idcommune: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    wilaya: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    commune: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    organismeoufiliale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddorganisme: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avecfiliale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    b: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    d: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    a: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tiers',
    schema: 'public',
    timestamps: false
  });
};
