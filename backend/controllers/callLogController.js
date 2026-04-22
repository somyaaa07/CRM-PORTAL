import { CallLog, Lead, User } from '../models/index.js';

const saveCallLog = async (req, res) => {
  try {
    const agentId = req.user.id;
    const {
      leadId,
      disposition,
      notes,
      followUpDate,
      alertEnabled,
      callDuration,
    } = req.body;

    if (!leadId || !disposition) {
      return res.status(400).json({
        message: '❌ leadId and disposition is Necessary',
      });
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: '❌ there is no Lead.' });
    }

    if (lead.assignedTo !== agentId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: '❌ This Lead is not Being Assigned to you',
      });
    }

    // ── Purane CallLog alerts band karo ───────────────────
    await CallLog.update(
      { alertEnabled: false },
      { where: { leadId, agentId } }
    );

    // ── Naya Call Log banao ───────────────────────────────
    const callLog = await CallLog.create({
      leadId,
      agentId,
      disposition,
      notes: notes || null,
      followUpDate: followUpDate || null,
      alertEnabled: followUpDate ? (alertEnabled || false) : false,
      callDuration: callDuration || 0,
      calledAt: new Date(),
    });

    // ── Lead update karo ──────────────────────────────────
    const statusMap = {
      'Answered': 'Contacted',
      'No Answer': 'Contacted',
      'Busy': 'Contacted',
      'Voicemail': 'Contacted',
      'Wrong Number': 'Not Interested',
      'Callback Requested': 'Follow-Up',
    };

    const updateData = {
      status: statusMap[disposition] || 'Contacted',
    };

    if (notes) updateData.notes = notes;

    // ── KEY FIX: Follow-up date handle karo ───────────────
    if (followUpDate) {
      // Naya follow-up diya → save karo (alert aayega tab)
      updateData.followUpDate = followUpDate;
    } else {
      // Follow-up nahi diya → clear karo (alert band)
      updateData.followUpDate = null;
    }

    await lead.update(updateData);

    res.status(201).json({
      message: '✅ Call log saved! Alert is being Cleared',
      callLog,
      updatedLead: {
        id: lead.id,
        status: updateData.status,
        followUpDate: updateData.followUpDate || null,
      },
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

const getCallLogsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const logs = await CallLog.findAll({
      where: { leadId },
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'name'],
      }],
      order: [['calledAt', 'DESC']],
    });
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

const getMyCallLogs = async (req, res) => {
  try {
    const agentId = req.user.id;
    const logs = await CallLog.findAll({
      where: { agentId },
      include: [{
        model: Lead,
        as: 'lead',
        attributes: ['id', 'name', 'phone'],
      }],
      order: [['calledAt', 'DESC']],
    });
    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

export { saveCallLog, getCallLogsByLead, getMyCallLogs };