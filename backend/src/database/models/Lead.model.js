import { Model, DataTypes } from 'sequelize';

export class Lead extends Model {
  static associate(models) {
    Lead.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'assignee' });
    Lead.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Lead.hasMany(models.LeadNote, { foreignKey: 'leadId', as: 'notes', onDelete: 'CASCADE' });
    Lead.hasMany(models.ActivityLog, { foreignKey: 'leadId', as: 'logs', onDelete: 'CASCADE' });
  }
}

export default (sequelize) => {
  Lead.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'lost', 'won'),
      allowNull: false,
      defaultValue: 'new'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Lead',
    tableName: 'Leads',
    timestamps: true
  });

  return Lead;
};
