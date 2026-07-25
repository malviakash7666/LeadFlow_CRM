import { Model, DataTypes } from 'sequelize';

export class LeadNote extends Model {
  static associate(models) {
    LeadNote.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'lead' });
    LeadNote.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export default (sequelize) => {
  LeadNote.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    note: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LeadNote',
    tableName: 'LeadNotes',
    timestamps: true
  });

  return LeadNote;
};
