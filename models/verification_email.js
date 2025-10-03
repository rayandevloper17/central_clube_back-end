import { Sequelize, DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('utilisateur', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    prenom: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    numero_telephone: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    mot_de_passe: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    credit_gold_padel: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    points: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    note: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    date_misajour: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    credit_gold_soccer: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    credit_silver_padel: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    credit_silver_soccer: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'utilisateur',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "idx_utilisateur_email",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "utilisateur_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "utilisateur_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};