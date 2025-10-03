const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('donnesoinss', {
    iddonsoin: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idpatient: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codepatient: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateheure: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    typesoinsss: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codesale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    litsss: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datesortie: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    typepayeur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idpayeur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationpayeur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codepayeur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idmedtraitant: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codemedtraitant: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationmedtraitant: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    objectsoin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatdemandesoin: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddateids: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origine: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idservice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idlit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codelit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idsalle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codesalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tarificationtype: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    datedebutss: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tarifs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idcaisse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payer: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    latva: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    lettc: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codespec: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationspec: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contexte: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    convention: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeint: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desint: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prixint: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    patientstype: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateentree: {
      type: DataTypes.DATE,
      allowNull: true
    },
    idconv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    montantverser: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codefililale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numerodepriseencharge: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idfiliale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    montantdebours: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    liendeparente: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nomassure: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenomassure: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nomagent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenomagent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    matriculeclient: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numordre: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datepriseencharge: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    datetablissement: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dateexam: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    aa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bb: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dd: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numdossier: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    numpriseencharge2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datepriseencharge2: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dateetablissement2: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'donnesoinss',
    schema: 'public',
    timestamps: false
  });
};
