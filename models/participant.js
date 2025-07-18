import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Participant extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_match: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_utilisateur: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    rejoins: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    est_createur: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'participant',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_participant_match",
        fields: [
          { name: "id_match" },
        ]
      },
      {
        name: "participant_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
