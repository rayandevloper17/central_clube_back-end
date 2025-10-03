import { Sequelize, DataTypes } from 'sequelize';

export default function(sequelize) {
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
    }
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