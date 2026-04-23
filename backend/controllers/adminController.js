import { User, Lead, CallLog } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// ─── Dashboard Stats ───────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const totalLeads     = await Lead.count();
    const totalAgents    = await User.count({ where: { role: 'agent' } });
    const convertedLeads = await Lead.count({ where: { status: 'Converted' } });
    const totalCalls     = await CallLog.count();
    const newLeads       = await Lead.count({ where: { status: 'New' } });
    const followUpLeads  = await Lead.count({ where: { status: 'Follow-Up' } });
    const lostLeads      = await Lead.count({ where: { status: 'Lost' } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCalls = await CallLog.count({
      where: { calledAt: { [Op.gte]: todayStart } },
    });

    const conversionRate = totalLeads
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

    res.json({
      totalLeads, totalAgents, convertedLeads,
      totalCalls, newLeads, followUpLeads,
      lostLeads, todayCalls, conversionRate,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Saare Agents ──────────────────────────────────────────
const getAllAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where:      { role: 'agent' },
      attributes: ['id', 'name', 'email', 'isActive', 'createdAt'],
    });

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const totalLeads     = await Lead.count({ where: { assignedTo: agent.id } });
        const convertedLeads = await Lead.count({
          where: { assignedTo: agent.id, status: 'Converted' },
        });
        const totalCalls = await CallLog.count({ where: { agentId: agent.id } });
        return { ...agent.toJSON(), totalLeads, convertedLeads, totalCalls };
      })
    );

    res.json({ total: agentsWithStats.length, agents: agentsWithStats });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Add Karo ────────────────────────────────────────
const addAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: '❌ Sab fields zaroori hain.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: '❌ Email already registered.' });
    }

    const agent = await User.create({ name, email, password, role: 'agent' });

    res.status(201).json({
      message: '✅ Agent added!',
      agent: {
        id: agent.id, name: agent.name,
        email: agent.email, role: agent.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Toggle ──────────────────────────────────────────
const toggleAgentStatus = async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await User.findOne({ where: { id: agentId, role: 'agent' } });
    if (!agent) {
      return res.status(404).json({ message: '❌ Agent nahi mila.' });
    }
    await agent.update({ isActive: !agent.isActive });
    res.json({
      message: `✅ Agent ${agent.isActive ? 'activated' : 'deactivated'}!`,
      isActive: agent.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Password Reset ──────────────────────────────────
const resetAgentPassword = async (req, res) => {
  try {
    const { agentId }    = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: '❌ Password kam se kam 6 characters ka hona chahiye.',
      });
    }

    const agent = await User.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: '❌ Agent nahi mila.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await agent.update({ password: hashed });
    res.json({ message: '✅ Password reset ho gaya!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Lead Delete ───────────────────────────────────────────
const deleteLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: '❌ Lead nahi mili.' });
    }
    await CallLog.destroy({ where: { leadId } });
    await lead.destroy();
    res.json({ message: '✅ Lead deleted!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Reports ─────────────────────────────────────────
const getAgentReports = async (req, res) => {
  try {
    const agents = await User.findAll({
      where:      { role: 'agent' },
      attributes: ['id', 'name', 'email'],
    });

    const reports = await Promise.all(
      agents.map(async (agent) => {
        const totalLeads     = await Lead.count({ where: { assignedTo: agent.id } });
        const convertedLeads = await Lead.count({
          where: { assignedTo: agent.id, status: 'Converted' },
        });
        const lostLeads = await Lead.count({
          where: {
            assignedTo: agent.id,
            status: { [Op.in]: ['Lost', 'Not Interested'] },
          },
        });
        const totalCalls = await CallLog.count({ where: { agentId: agent.id } });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCalls = await CallLog.count({
          where: {
            agentId:  agent.id,
            calledAt: { [Op.gte]: todayStart },
          },
        });

        const conversionRate = totalLeads
          ? Math.round((convertedLeads / totalLeads) * 100)
          : 0;

        return {
          agentId: agent.id, agentName: agent.name,
          agentEmail: agent.email, totalLeads,
          convertedLeads, lostLeads, totalCalls,
          todayCalls, conversionRate,
        };
      })
    );

    reports.sort((a, b) => b.convertedLeads - a.convertedLeads);
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Daily Stats (Agent khud dekhe) ─────────────────
const getAgentDailyStats = async (req, res) => {
  try {
    const agentId = req.user.id;
    const days    = 14;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayLeads = await Lead.count({
        where: {
          assignedTo: agentId,
          createdAt:  { [Op.between]: [date, nextDate] },
        },
      });

      const dayConverted = await Lead.count({
        where: {
          assignedTo: agentId,
          status:     'Converted',
          updatedAt:  { [Op.between]: [date, nextDate] },
        },
      });

      const dayCalls = await CallLog.count({
        where: {
          agentId,
          calledAt: { [Op.between]: [date, nextDate] },
        },
      });

      const dayAnswered = await CallLog.count({
        where: {
          agentId,
          disposition: 'Answered',
          calledAt:    { [Op.between]: [date, nextDate] },
        },
      });

      dailyData.push({
        date: date.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short',
        }),
        leads:     dayLeads,
        converted: dayConverted,
        calls:     dayCalls,
        answered:  dayAnswered,
      });
    }

    res.json({ dailyData });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Admin Overall Daily Stats ─────────────────────────────
const getAdminDailyStats = async (req, res) => {
  try {
    const days      = 14;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayLeads = await Lead.count({
        where: { createdAt: { [Op.between]: [date, nextDate] } },
      });

      const dayConverted = await Lead.count({
        where: {
          status:    'Converted',
          updatedAt: { [Op.between]: [date, nextDate] },
        },
      });

      const dayCalls = await CallLog.count({
        where: { calledAt: { [Op.between]: [date, nextDate] } },
      });

      const dayAnswered = await CallLog.count({
        where: {
          disposition: 'Answered',
          calledAt:    { [Op.between]: [date, nextDate] },
        },
      });

      dailyData.push({
        date: date.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short',
        }),
        leads: dayLeads, converted: dayConverted,
        calls: dayCalls, answered:  dayAnswered,
      });
    }

    res.json({ dailyData });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Single Agent Stats (Admin view) ──────────────────────
const getSingleAgentStats = async (req, res) => {
  try {
    const { agentId } = req.params;
    const days        = 14;
    const dailyData   = [];

    const agent = await User.findOne({
      where:      { id: agentId, role: 'agent' },
      attributes: ['id', 'name'],
    });

    if (!agent) {
      return res.status(404).json({ message: '❌ Agent nahi mila.' });
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayLeads = await Lead.count({
        where: {
          assignedTo: agentId,
          createdAt:  { [Op.between]: [date, nextDate] },
        },
      });

      const dayConverted = await Lead.count({
        where: {
          assignedTo: agentId,
          status:     'Converted',
          updatedAt:  { [Op.between]: [date, nextDate] },
        },
      });

      const dayCalls = await CallLog.count({
        where: {
          agentId,
          calledAt: { [Op.between]: [date, nextDate] },
        },
      });

      const dayAnswered = await CallLog.count({
        where: {
          agentId,
          disposition: 'Answered',
          calledAt:    { [Op.between]: [date, nextDate] },
        },
      });

      dailyData.push({
        date: date.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short',
        }),
        leads: dayLeads, converted: dayConverted,
        calls: dayCalls, answered:  dayAnswered,
      });
    }

    res.json({
      agent:    { id: agent.id, name: agent.name },
      dailyData,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Exports ───────────────────────────────────────────────
export {
  getDashboardStats,
  getAllAgents,
  addAgent,
  toggleAgentStatus,
  resetAgentPassword,
  deleteLead,
  getAgentReports,
  getAgentDailyStats,
  getAdminDailyStats,
  getSingleAgentStats,
};