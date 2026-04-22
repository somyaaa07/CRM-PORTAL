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

    // Aaj ke calls
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCalls = await CallLog.count({
      where: { calledAt: { [Op.gte]: todayStart } },
    });

    const conversionRate = totalLeads
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

    res.json({
      totalLeads,
      totalAgents,
      convertedLeads,
      totalCalls,
      newLeads,
      followUpLeads,
      lostLeads,
      todayCalls,
      conversionRate,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Saare Agents ──────────────────────────────────────────
const getAllAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: ['id', 'name', 'email', 'isActive', 'createdAt'],
    });

    // Har agent ke leads aur calls count karo
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const totalLeads     = await Lead.count({ where: { assignedTo: agent.id } });
        const convertedLeads = await Lead.count({
          where: { assignedTo: agent.id, status: 'Converted' },
        });
        const totalCalls     = await CallLog.count({ where: { agentId: agent.id } });

        return {
          ...agent.toJSON(),
          totalLeads,
          convertedLeads,
          totalCalls,
        };
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
      return res.status(400).json({ message: '❌ All fields are necessary .' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: '❌ Email already registered.' });
    }

    const agent = await User.create({ name, email, password, role: 'agent' });

    res.status(201).json({
      message: '✅ Agent added!',
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Activate / Deactivate ──────────────────────────
const toggleAgentStatus = async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = await User.findOne({
      where: { id: agentId, role: 'agent' },
    });
    if (!agent) {
      return res.status(404).json({ message: '❌ Didnt find agent' });
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

// ─── Agent Ka Password Reset ───────────────────────────────
const resetAgentPassword = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: '❌ Password must be have atleast of 6 words',
      });
    }

    const agent = await User.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: '❌ didnt find the agent' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await agent.update({ password: hashed });

    res.json({ message: '✅ Password has been reset' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Lead Delete Karo ──────────────────────────────────────
const deleteLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: '❌ Didnt find the lead' });
    }

    // Pehle call logs delete karo
    await CallLog.destroy({ where: { leadId } });
    await lead.destroy();

    res.json({ message: '✅ Lead deleted!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent-wise Report ─────────────────────────────────────
const getAgentReports = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: ['id', 'name', 'email'],
    });

    const reports = await Promise.all(
      agents.map(async (agent) => {
        const totalLeads     = await Lead.count({ where: { assignedTo: agent.id } });
        const convertedLeads = await Lead.count({
          where: { assignedTo: agent.id, status: 'Converted' },
        });
        const lostLeads      = await Lead.count({
          where: {
            assignedTo: agent.id,
            status: { [Op.in]: ['Lost', 'Not Interested'] },
          },
        });
        const totalCalls     = await CallLog.count({ where: { agentId: agent.id } });

        // Aaj ke calls
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCalls = await CallLog.count({
          where: {
            agentId: agent.id,
            calledAt: { [Op.gte]: todayStart },
          },
        });

        const conversionRate = totalLeads
          ? Math.round((convertedLeads / totalLeads) * 100)
          : 0;

        return {
          agentId: agent.id,
          agentName: agent.name,
          agentEmail: agent.email,
          totalLeads,
          convertedLeads,
          lostLeads,
          totalCalls,
          todayCalls,
          conversionRate,
        };
      })
    );

    // Best performing agent pehle
    reports.sort((a, b) => b.convertedLeads - a.convertedLeads);

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Daily Conversion Stats (Agent ke liye) ────────────────
const getAgentDailyStats = async (req, res) => {
  try {
    const agentId = req.user.id;

    // Last 30 days ka data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Is agent ke saare leads lo
    const leads = await Lead.findAll({
      where: {
        assignedTo: agentId,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['id', 'status', 'createdAt'],
    });

    // Call logs bhi lo
    const callLogs = await CallLog.findAll({
      where: {
        agentId,
        calledAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['id', 'disposition', 'calledAt'],
    });

    // ── Daily data banao ───────────────────────────────────
    // Last 14 days ka chart dikhayenge
    const days = 14;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Us din ke leads
      const dayLeads = leads.filter((l) => {
        const d = new Date(l.createdAt);
        return d >= date && d < nextDate;
      });

      // Us din ke calls
      const dayCalls = callLogs.filter((c) => {
        const d = new Date(c.calledAt);
        return d >= date && d < nextDate;
      });

      // Us din ke conversions
      const dayConverted = leads.filter((l) => {
        const d = new Date(l.createdAt);
        return d >= date && d < nextDate && l.status === 'Converted';
      });

      dailyData.push({
        date: date.toLocaleDateString('en-IN', {
          day:   '2-digit',
          month: 'short',
        }),
        leads:      dayLeads.length,
        calls:      dayCalls.length,
        converted:  dayConverted.length,
        answered:   dayCalls.filter((c) => c.disposition === 'Answered').length,
      });
    }

    res.json({ dailyData });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};
// ─── Admin Overall Daily Stats ─────────────────────────────
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

      // Naye leads us din
      const dayLeads = await Lead.count({
        where: {
          createdAt: { [Op.between]: [date, nextDate] },
        },
      });

      // Converted us din (updatedAt se)
      const dayConverted = await Lead.count({
        where: {
          status:    'Converted',
          updatedAt: { [Op.between]: [date, nextDate] },
        },
      });

      // Total calls us din
      const dayCalls = await CallLog.count({
        where: {
          calledAt: { [Op.between]: [date, nextDate] },
        },
      });

      // Answered calls
      const dayAnswered = await CallLog.count({
        where: {
          disposition: 'Answered',
          calledAt:    { [Op.between]: [date, nextDate] },
        },
      });

      dailyData.push({
        date: date.toLocaleDateString('en-IN', {
          day:   '2-digit',
          month: 'short',
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

// ─── Single Agent Daily Stats (Admin view) ─────────────────
// ─── Single Agent Daily Stats (Admin view) ─────────────────
const getSingleAgentStats = async (req, res) => {
  try {
    const { agentId } = req.params;
    const days        = 14;
    const dailyData   = [];

    // Pehle verify karo agent exist karta hai
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

      // ── Calls us din ke ───────────────────────────────────
      // calledAt = actual call ki date → Yeh accurate hai
      const dayCalls = await CallLog.count({
        where: {
          agentId,
          calledAt: { [Op.between]: [date, nextDate] },
        },
      });

      // ── Answered calls ────────────────────────────────────
      const dayAnswered = await CallLog.count({
        where: {
          agentId,
          disposition: 'Answered',
          calledAt:    { [Op.between]: [date, nextDate] },
        },
      });

      // ── Converted leads us din ke ─────────────────────────
      // updatedAt use karo — jis din status Converted hua
      const dayConverted = await Lead.count({
        where: {
          assignedTo: agentId,
          status:     'Converted',
          updatedAt:  { [Op.between]: [date, nextDate] },
        },
      });

      // ── Naye assigned leads us din ke ─────────────────────
      const dayLeads = await Lead.count({
        where: {
          assignedTo: agentId,
          createdAt:  { [Op.between]: [date, nextDate] },
        },
      });

      dailyData.push({
        date: date.toLocaleDateString('en-IN', {
          day:   '2-digit',
          month: 'short',
        }),
        leads:     dayLeads,
        converted: dayConverted,
        calls:     dayCalls,
        answered:  dayAnswered,
      });
    }

    res.json({
      agent:     { id: agent.id, name: agent.name },
      dailyData,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};
export {
  getDashboardStats,
  getAllAgents,
  addAgent,
  toggleAgentStatus,
  resetAgentPassword,
  deleteLead,
  getAgentReports,
  getAgentDailyStats,
  getSingleAgentStats,
  getAdminDailyStats
};