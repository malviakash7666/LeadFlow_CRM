import { Model, DataTypes } from 'sequelize';

export class User extends Model {
  static associate(models) {
    User.hasMany(models.Lead, { foreignKey: 'assignedTo', as: 'assignedLeads' });
    User.hasMany(models.Lead, { foreignKey: 'createdBy', as: 'createdLeads' });
    User.hasMany(models.LeadNote, { foreignKey: 'userId', as: 'notes' });
    User.hasMany(models.ActivityLog, { foreignKey: 'userId', as: 'logs' });
  }
}

export default (sequelize) => {
  User.init({
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
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      allowNull: false,
      defaultValue: 'member'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  });

  return User;
};
