import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class notification extends Model {
    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    autoIncrement: true,
                    type: DataTypes.BIGINT,
                    allowNull: false,
                    primaryKey: true,
                },
                recipient_id: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                    references: {
                        model: 'utilisateur',
                        key: 'id',
                    },
                },
                reservation_id: {
                    type: DataTypes.BIGINT,
                    allowNull: true,
                    references: {
                        model: 'reservation',
                        key: 'id',
                    },
                },
                submitter_id: {
                    type: DataTypes.BIGINT,
                    allowNull: true,
                    references: {
                        model: 'utilisateur',
                        key: 'id',
                    },
                },
                type: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    defaultValue: 'info',
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                score_data: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                is_read: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                read_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: 'notification',
                schema: 'public',
                timestamps: false,
                indexes: [
                    {
                        name: 'notification_pkey',
                        unique: true,
                        fields: [{ name: 'id' }],
                    },
                    {
                        name: 'idx_notification_recipient',
                        fields: [{ name: 'recipient_id' }],
                    },
                    {
                        name: 'idx_notification_reservation',
                        fields: [{ name: 'reservation_id' }],
                    },
                    {
                        name: 'idx_notification_created_at',
                        fields: [{ name: 'created_at' }],
                    },
                    {
                        name: 'idx_notification_is_read',
                        fields: [{ name: 'is_read' }],
                    },
                ],
            }
        );
    }
}
