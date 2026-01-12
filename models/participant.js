import { Sequelize, DataTypes } from 'sequelize';

export default function (sequelize) {
  return sequelize.define('participant', {
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

    rejoins: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    est_createur: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    id_reservation: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'reservation',
        key: 'id'
      }
    },
    statepaiement: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 1
    },
    typepaiement: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 1
    }
    ,
    team: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 3
      }
    }
  }, {
    sequelize,
    tableName: 'participant',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_participant_reservation",
        fields: [
          { name: "id_reservation" },
        ]
      },
      {
        name: "participant_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "uniq_participant_reservation_team",
        unique: true,
        fields: [
          { name: "id_reservation" },
          { name: "team" }
        ],
        where: {
          team: {
            [Sequelize.Op.ne]: null
          }
        }
      }
    ]
  });
};