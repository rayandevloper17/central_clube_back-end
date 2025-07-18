import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class VerificationEmail extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_utilisateur: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    token: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'verification_email',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "verification_email_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
