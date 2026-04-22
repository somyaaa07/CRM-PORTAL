import sequelize from '../config/database.js';
import User from './User.js';
import Lead from './Lead.js';
import CallLog from './CallLogs.js';

// ─── Relationships ─────────────────────────────────────────

User.hasMany(Lead, { foreignKey: 'assignedTo', as: 'assignedLeads' });
Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedAgent' });

Lead.hasMany(CallLog, { foreignKey: 'leadId', as: 'callLogs' });
CallLog.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

User.hasMany(CallLog, { foreignKey: 'agentId', as: 'callsMade' });
CallLog.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

export { sequelize, User, Lead, CallLog };