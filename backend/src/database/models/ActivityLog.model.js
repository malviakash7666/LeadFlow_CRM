import { Model, DataTypes } from 'sequelize';

export class ActivityLog extends Model {
  static associate(models) {
    ActivityLog.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'lead' });
    ActivityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export default (sequelize) => {
  ActivityLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Leads',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'ActivityLogs',
    timestamps: true
  });

  return ActivityLog;
};
