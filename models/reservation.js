import { Sequelize, DataTypes } from 'sequelize';

export default function (sequelize) {
  return sequelize.define('reservation', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_utilisateur: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'utilisateur',
        key: 'id'
      }
    },
    id_terrain: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'terrain',
        key: 'id'
      }
    },
    id_plage_horaire: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'plage_horaire',
        key: 'id'
      }
    },
    id_plage_horaire: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    etat: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: "En attente"
    },
    // 0 = active, 1 = cancelled
    isCancel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    prix_total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    date_modif: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    qrcode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nombre_joueurs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typer: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 1
    },
    nombre_joueurs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coder: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // ════════════════════════════════════════════════════════════════════════════
    // SCORE & MATCH LOGIC (STRICT - NEW)
    // ════════════════════════════════════════════════════════════════════════════
    Set1A: { type: DataTypes.INTEGER, allowNull: true },
    Set1B: { type: DataTypes.INTEGER, allowNull: true },
    Set2A: { type: DataTypes.INTEGER, allowNull: true },
    Set2B: { type: DataTypes.INTEGER, allowNull: true },
    Set3A: { type: DataTypes.INTEGER, allowNull: true },
    Set3B: { type: DataTypes.INTEGER, allowNull: true },

    scoormatch: { type: DataTypes.TEXT, allowNull: true },
    teamwin: { type: DataTypes.INTEGER, allowNull: true },
    supertiebreak: { type: DataTypes.INTEGER, allowNull: true },

    score_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    last_score_update: {
      type: DataTypes.DATE,
      allowNull: true
    },

    last_score_submitter: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    // Legacy fields (kept for backward compat or reference, but logic will use new fields)
    p1A: { type: DataTypes.TEXT, allowNull: true },
    p2A: { type: DataTypes.TEXT, allowNull: true },
    p1B: { type: DataTypes.TEXT, allowNull: true }, // Fixed typo in user request
    p2B: { type: DataTypes.TEXT, allowNull: true }, // Fixed typo in user request

    ispayed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
  }, {
    sequelize,
    tableName: 'reservation',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,

    indexes: [
      {
        name: "idx_reservation_date",
        fields: [
          { name: "date" },
        ]
      },
      {
        name: "idx_reservation_utilisateur",
        fields: [
          { name: "id_utilisateur" },
        ]
      },
      // Unique constraint removed to allow multiple open matches (typer=2) to coexist
      // Logic in service layer handles Private vs Open conflicts
      {
        name: "reservation_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};