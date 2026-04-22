import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CallLog = sequelize.define('CallLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
      
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  disposition: {
    type: DataTypes.ENUM(
      'Answered',
      'No Answer',
      'Busy',
      'Voicemail',
      'Wrong Number',
      'Callback Requested'
    ),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  alertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  callDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  calledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

export default CallLog;