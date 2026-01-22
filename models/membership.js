import { Sequelize, DataTypes } from 'sequelize';

export default function (sequelize) {
    return sequelize.define('membership', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        id_user: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'utilisateur',
                key: 'id'
            }
        },
        id_club: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: 'Club/Terrain ID - references the club where membership is valid'
        },
        dateend: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: 'Membership expiry date'
        },
        typemmbership: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 4
            },
            comment: '0=normal, 1=access, 2=gold, 3=platinum, 4=infinity'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'membership',
        schema: 'public',
        timestamps: false,
        indexes: [
            {
                name: 'membership_pkey',
                unique: true,
                fields: [{ name: 'id' }]
            },
            {
                name: 'idx_membership_user',
                fields: [{ name: 'id_user' }]
            },
            {
                name: 'idx_membership_club',
                fields: [{ name: 'id_club' }]
            },
            {
                name: 'idx_membership_expiry',
                fields: [{ name: 'dateend' }]
            },
            {
                name: 'idx_membership_user_club',
                fields: [{ name: 'id_user' }, { name: 'id_club' }]
            },
            {
                name: 'membership_id_user_id_club_key',
                unique: true,
                fields: [{ name: 'id_user' }, { name: 'id_club' }]
            }
        ]
    });
};
