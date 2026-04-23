import { CallLog, Lead, User } from '../models/index.js';

// ─── Call Log Save Karo ────────────────────────────────────
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

    // Validation
    if (!leadId || !disposition) {
      return res.status(400).json({
        message: '❌ leadId aur disposition zaroori hain.',
      });
    }

    // Lead exist karta hai?
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: '❌ Lead nahi mili.' });
    }

    // Kya yeh lead is agent ko assign hai?
    if (lead.assignedTo !== agentId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: '❌ Yeh lead aapko assign nahi hai.',
      });
    }

    // ── Purane CallLog alerts band karo ───────────────────
    // Naya call log save hone pe purane alerts clear karo
    await CallLog.update(
      {
        alertEnabled: false,
        followUpDate: null, // ← Purane follow-up dates bhi clear
      },
      { where: { leadId, agentId } }
    );

    // ── Naya Call Log banao ───────────────────────────────
    const callLog = await CallLog.create({
      leadId,
      agentId,
      disposition,
      notes:        notes        || null,
      followUpDate: followUpDate || null,
      // Agar naya follow-up diya tabhi alert on, warna off
      alertEnabled: followUpDate ? (alertEnabled || false) : false,
      callDuration: callDuration || 0,
      calledAt:     new Date(),
    });

    // ── Lead Status Auto-Update ───────────────────────────
    // Disposition ke hisaab se lead status update karo
    const statusMap = {
      'Answered':           'Contacted',
      'No Answer':          'Contacted',
      'Busy':               'Contacted',
      'Voicemail':          'Contacted',
      'Wrong Number':       'Not Interested',
      'Callback Requested': 'Follow-Up',
    };

    const updateData = {
      status: statusMap[disposition] || 'Contacted',
    };

    if (notes) updateData.notes = notes;

    // ── KEY FIX: Follow-up date handle ────────────────────
    if (followUpDate) {
      // Naya follow-up diya → save karo (alert aayega tab)
      updateData.followUpDate = followUpDate;
    } else {
      // Follow-up nahi diya → clear karo (alert band)
      updateData.followUpDate = null;
    }

    await lead.update(updateData);

    res.status(201).json({
      message: '✅ Call log saved! Alert clear ho gaya.',
      callLog,
      updatedLead: {
        id:           lead.id,
        status:       updateData.status,
        followUpDate: updateData.followUpDate || null,
      },
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Ek Lead Ki Call History ───────────────────────────────
const getCallLogsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const logs = await CallLog.findAll({
      where: { leadId },
      include: [{
        model:      User,
        as:         'agent',
        attributes: ['id', 'name'],
      }],
      order: [['calledAt', 'DESC']],
    });

    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Ki Apni Call History ───────────────────────────
const getMyCallLogs = async (req, res) => {
  try {
    const agentId = req.user.id;

    const logs = await CallLog.findAll({
      where: { agentId },
      include: [{
        model:      Lead,
        as:         'lead',
        attributes: ['id', 'name', 'phone'],
      }],
      order: [['calledAt', 'DESC']],
    });

    res.json({ total: logs.length, logs });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Exports ───────────────────────────────────────────────
export { saveCallLog, getCallLogsByLead, getMyCallLogs };