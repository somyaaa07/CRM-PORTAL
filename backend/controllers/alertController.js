import { Op } from 'sequelize';
import { Lead, CallLog } from '../models/index.js';

// ─── Agent ke due follow-ups ───────────────────────────────
const getMyAlerts = async (req, res) => {
  try {
    const agentId = req.user.id;
    const now     = new Date();

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Lead-level follow-ups
    const leadAlerts = await Lead.findAll({
      where: {
        assignedTo:   agentId,
        followUpDate: { [Op.between]: [new Date('2000-01-01'), todayEnd] },
        status: {
          [Op.notIn]: ['Converted', 'Lost', 'Not Interested'],
        },
      },
      attributes: ['id', 'name', 'phone', 'followUpDate', 'status'],
      order:      [['followUpDate', 'ASC']],
    });

    // CallLog-level alerts
    const callLogAlerts = await CallLog.findAll({
      where: {
        agentId,
        alertEnabled: true,
        followUpDate: { [Op.between]: [new Date('2000-01-01'), todayEnd] },
      },
      include: [{
        model: Lead,
        as:    'lead',
        attributes: ['id', 'name', 'phone', 'status'],
        where: {
          status: {
            [Op.notIn]: ['Converted', 'Lost', 'Not Interested'],
          },
        },
        required: true,
      }],
      order: [['followUpDate', 'ASC']],
    });

    const alerts = [
      ...leadAlerts.map((l) => ({
        type:         'lead',
        leadId:       l.id,
        name:         l.name,
        phone:        l.phone,
        followUpDate: l.followUpDate,
        status:       l.status,
        overdue:      new Date(l.followUpDate) < now,
      })),
      ...callLogAlerts.map((c) => ({
        type:         'calllog',
        leadId:       c.lead?.id,
        callLogId:    c.id,
        name:         c.lead?.name,
        phone:        c.lead?.phone,
        followUpDate: c.followUpDate,
        status:       c.lead?.status,
        overdue:      new Date(c.followUpDate) < now,
      })),
    ];

    // Duplicates remove
    const seen   = new Set();
    const unique = alerts.filter((a) => {
      if (seen.has(a.leadId)) return false;
      seen.add(a.leadId);
      return true;
    });

    unique.sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return  1;
      return new Date(a.followUpDate) - new Date(b.followUpDate);
    });

    res.json({
      total:    unique.length,
      overdue:  unique.filter((a) =>  a.overdue).length,
      upcoming: unique.filter((a) => !a.overdue).length,
      alerts:   unique,
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Alert Dismiss — PROPERLY ─────────────────────────────
// Dono jagah se clear karo:
// 1. Lead.followUpDate = null
// 2. CallLog.alertEnabled = false
const dismissAlert = async (req, res) => {
  try {
    const { leadId } = req.params;
    const agentId    = req.user.id;

    // Lead dhundho
    const lead = await Lead.findOne({
      where: { id: leadId, assignedTo: agentId },
    });

    if (!lead) {
      return res.status(404).json({ message: '❌ Lead nahi mili.' });
    }

    // ── Lead ka followUpDate clear karo ───────────────────
    await lead.update({ followUpDate: null });

    // ── Is lead ke saare CallLog alerts bhi band karo ─────
    await CallLog.update(
      { alertEnabled: false, followUpDate: null },
      { where: { leadId, agentId } }
    );

    res.json({ message: '✅ Alert dismissed!' });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

export { getMyAlerts, dismissAlert };