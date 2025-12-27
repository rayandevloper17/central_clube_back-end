import { Sequelize, DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('verification_email', {
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
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'verification_email',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'verification_email_user_idx',
        fields: [ { name: 'id_utilisateur' } ]
      }
    ]
  });
};