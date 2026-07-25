import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import initUser, { User } from './User.model.js';
import initLead, { Lead } from './Lead.model.js';
import initLeadNote, { LeadNote } from './LeadNote.model.js';
import initActivityLog, { ActivityLog } from './ActivityLog.model.js';
import initNotification, { Notification } from './Notification.model.js';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

let sequelize;
if (env === 'production') {
  sequelize = new Sequelize(
    process.env.PROD_DB_NAME,
    process.env.PROD_DB_USERNAME,
    process.env.PROD_DB_PASSWORD,
    {
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    }
  );
} else if (env === 'test') {
  sequelize = new Sequelize(
    process.env.TEST_DB_NAME || process.env.DEV_DB_NAME || 'LeadFlow_CRM_test',
    process.env.TEST_DB_USERNAME || process.env.DEV_DB_USERNAME || 'postgres',
    process.env.TEST_DB_PASSWORD || process.env.DEV_DB_PASSWORD || 'postgres',
    {
      host: process.env.TEST_DB_HOST || process.env.DEV_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || process.env.DEV_DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DEV_DB_NAME || 'LeadFlow_CRM',
    process.env.DEV_DB_USERNAME || 'postgres',
    process.env.DEV_DB_PASSWORD || 'postgres',
    {
      host: process.env.DEV_DB_HOST || 'localhost',
      port: process.env.DEV_DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );
}

const db = {};

// Initialize models
db.User = initUser(sequelize);
db.Lead = initLead(sequelize);
db.LeadNote = initLeadNote(sequelize);
db.ActivityLog = initActivityLog(sequelize);
db.Notification = initNotification(sequelize);

// Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize, Sequelize, User, Lead, LeadNote, ActivityLog, Notification };
export default db;