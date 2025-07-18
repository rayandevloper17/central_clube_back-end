import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NoteUtilisateur extends Model {
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
    id_noteur: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_notee: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    note: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'note_utilisateur',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "note_utilisateur_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
