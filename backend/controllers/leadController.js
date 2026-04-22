import { Lead, User, CallLog } from '../models/index.js'; // ← CallLog add kiya
import { Op } from 'sequelize';
import xlsx from 'xlsx';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Lead Add Karo ─────────────────────────────────────────
const addLead = async (req, res) => {
  try {
    const { name, phone, email, source, priority, assignedTo } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: '❌ Name and phone are required.' });
    }

    const lead = await Lead.create({
      name, phone, email, source, priority, assignedTo,
    });

    res.status(201).json({ message: '✅ Lead added!', lead });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Saare Leads Lo (Admin) — With Pagination ──────────────
const getAllLeads = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      page  = 1,
      limit = 10,
    } = req.query;

    const where = {};
    if (status)   where.status   = status;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset   = (pageNum - 1) * limitNum;

    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'assignedAgent',
        attributes: ['id', 'name', 'email'],
      }],
      order:  [['createdAt', 'DESC']],
      limit:  limitNum,
      offset,
    });

    const totalPages  = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      leads,
      pagination: {
        totalLeads:  count,
        totalPages,
        currentPage: pageNum,
        limit:       limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Agent Ke Apne Leads — With Pagination ─────────────────
const getMyLeads = async (req, res) => {
  try {
    const agentId = req.user.id;
    const {
      status,
      search,
      page  = 1,
      limit = 12,
    } = req.query;

    // ── Filters ────────────────────────────────────────────
    const where = { assignedTo: agentId };

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // ── Pagination ─────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset   = (pageNum - 1) * limitNum;

    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      order: [
        ['followUpDate', 'ASC'],
        ['createdAt',    'DESC'],
      ],
      limit:  limitNum,
      offset,
    });

    const totalPages  = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      leads,
      pagination: {
        totalLeads:  count,
        totalPages,
        currentPage: pageNum,
        limit:       limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Lead Assign Karo Agent Ko ─────────────────────────────
const assignLead = async (req, res) => {
  try {
    const { leadId }  = req.params;
    const { agentId } = req.body;

    const agent = await User.findOne({
      where: { id: agentId, role: 'agent', isActive: true },
    });
    if (!agent) {
      return res.status(404).json({ message: '❌ Agent not found or inactive.' });
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: '❌ Lead not found.' });
    }

    await lead.update({ assignedTo: agentId });
    res.json({ message: `✅ Lead assigned to ${agent.name}!`, lead });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Lead Status Update Karo ───────────────────────────────
const updateLeadStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, notes, followUpDate, priority } = req.body;

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({ message: '❌ Lead not found.' });
    }

    await lead.update({
      ...(status       && { status }),
      ...(notes        && { notes }),
      ...(followUpDate && { followUpDate }),
      ...(priority     && { priority }),
    });

    res.json({ message: '✅ Lead updated!', lead });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Single Lead Detail ────────────────────────────────────
const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findByPk(leadId, {
      include: [{
        model: User,
        as: 'assignedAgent',
        attributes: ['id', 'name', 'email'],
      }],
    });

    if (!lead) {
      return res.status(404).json({ message: '❌ Lead not found.' });
    }

    res.json({ lead });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Lead Detail — Lead + Call Logs ek saath ──────────────
const getLeadDetail = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Lead with agent info
    const lead = await Lead.findByPk(leadId, {
      include: [{
        model: User,
        as: 'assignedAgent',
        attributes: ['id', 'name', 'email'],
      }],
    });

    if (!lead) {
      return res.status(404).json({ message: '❌ Lead nahi mili.' });
    }

    // Call logs with agent info
    const callLogs = await CallLog.findAll({
      where: { leadId },
      include: [{
        model: User,
        as: 'agent',
        attributes: ['id', 'name'],
      }],
      order: [['calledAt', 'DESC']],
    });

    res.json({ lead, callLogs });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Bulk Upload ───────────────────────────────────────────
const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '❌ File upload karo.' });
    }

    const rawAgentId = req.body.agentId;
    const agentId    = rawAgentId &&
                       rawAgentId !== 'undefined' &&
                       rawAgentId !== ''
      ? parseInt(rawAgentId, 10)
      : null;

    console.log('📌 Raw agentId:', rawAgentId);
    console.log('📌 Parsed agentId:', agentId);

    let assignedAgent = null;

    if (agentId) {
      assignedAgent = await User.findOne({
        where: { id: agentId, role: 'agent', isActive: true },
      });
      if (!assignedAgent) {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({
          message: '❌ Agent nahi mila ya inactive hai.',
        });
      }
      console.log('✅ Agent found:', assignedAgent.name);
    }

    const workbook  = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const allRows = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
    });

    console.log('📋 First 5 rows:', allRows.slice(0, 5));

    // Smart header detection
    let headerRowIndex = -1;

    for (let i = 0; i < Math.min(allRows.length, 15); i++) {
      const row = allRows[i].map((cell) =>
        String(cell).toLowerCase().trim()
      );
      const hasName  = row.some((c) => c.includes('name'));
      const hasPhone = row.some((c) =>
        c.includes('phone')   ||
        c.includes('mobile')  ||
        c.includes('contact') ||
        c.includes('no.')
      );
      if (hasName && hasPhone) {
        headerRowIndex = i;
        break;
      }
    }

    console.log('📋 Header found at row index:', headerRowIndex);

    if (headerRowIndex === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        message: '❌ "Name" aur "Phone/Mobile" columns nahi mile.',
      });
    }

    const headerRow = allRows[headerRowIndex];
    const dataRows  = allRows.slice(headerRowIndex + 1);

    console.log('📋 Column headers:', headerRow);
    console.log('📋 Total data rows:', dataRows.length);

    const nameIdx = headerRow.findIndex((h) =>
      String(h).toLowerCase().includes('name')
    );
    const phoneIdx = headerRow.findIndex((h) =>
      String(h).toLowerCase().includes('phone')  ||
      String(h).toLowerCase().includes('mobile') ||
      String(h).toLowerCase().includes('no.')    ||
      String(h).toLowerCase().includes('number')
    );
    const emailIdx = headerRow.findIndex((h) =>
      String(h).toLowerCase().includes('email')
    );
    const sourceIdx = headerRow.findIndex((h) =>
      String(h).toLowerCase().includes('source')      ||
      String(h).toLowerCase().includes('requirement') ||
      String(h).toLowerCase().includes('category')    ||
      String(h).toLowerCase().includes('type')
    );

    console.log(`📋 Indexes → Name:${nameIdx} Phone:${phoneIdx} Email:${emailIdx} Source:${sourceIdx}`);

    if (nameIdx === -1 || phoneIdx === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        message: `❌ Columns nahi mile. Headers: ${headerRow.join(', ')}`,
      });
    }

    const allPhones = dataRows
      .map((r) => String(r[phoneIdx] || '').trim())
      .filter(Boolean);

    const existingLeads = await Lead.findAll({
      where:      { phone: { [Op.in]: allPhones } },
      attributes: ['phone'],
    });
    const existingPhones = new Set(existingLeads.map((l) => l.phone));
    const seenPhones     = new Set();

    const validLeads = [];
    const failedRows = [];

    dataRows.forEach((row, index) => {
      const name  = String(row[nameIdx]  || '').trim();
      const phone = String(row[phoneIdx] || '').trim();
      const email = emailIdx  >= 0 ? String(row[emailIdx]  || '').trim() : '';
      const source= sourceIdx >= 0 ? String(row[sourceIdx] || '').trim() : 'Excel Import';

      // Empty rows skip
      if (!name && !phone) return;

      // Date separator rows skip
      const looksLikeDateRow =
        /^\(?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\)?$/.test(name) ||
        /^\(?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\)?$/.test(phone);
      if (looksLikeDateRow) return;

      // Brackets-only name skip
      const cleanName = name.replace(/[\(\)\[\]\{\}]/g, '').trim();
      if (!cleanName) return;

      if (!name) {
        failedRows.push({ row: index + headerRowIndex + 2, reason: 'Name missing' });
        return;
      }
      if (!phone) {
        failedRows.push({ row: index + headerRowIndex + 2, reason: 'Phone missing' });
        return;
      }

      const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');

      if (cleanPhone.length < 7) {
        failedRows.push({
          row:    index + headerRowIndex + 2,
          reason: `Invalid phone: ${phone}`,
        });
        return;
      }
      if (existingPhones.has(cleanPhone)) {
        failedRows.push({
          row:    index + headerRowIndex + 2,
          reason: `Duplicate in DB: ${cleanPhone}`,
        });
        return;
      }
      if (seenPhones.has(cleanPhone)) {
        failedRows.push({
          row:    index + headerRowIndex + 2,
          reason: `Duplicate in file: ${cleanPhone}`,
        });
        return;
      }

      seenPhones.add(cleanPhone);
      validLeads.push({
        name:       cleanName,
        phone:      cleanPhone,
        email:      email  || null,
        source:     source || 'Excel Import',
        status:     'New',
        priority:   'Medium',
        assignedTo: agentId,
      });
    });

    console.log(`📌 Valid: ${validLeads.length} | Failed: ${failedRows.length}`);

    let insertedCount = 0;
    const BATCH_SIZE  = 500;

    if (validLeads.length > 0) {
      for (let i = 0; i < validLeads.length; i += BATCH_SIZE) {
        const batch = validLeads.slice(i, i + BATCH_SIZE);
        await Lead.bulkCreate(batch, { ignoreDuplicates: true });
        insertedCount += batch.length;
      }
    }

    fs.unlink(req.file.path, (err) => {
      if (err) console.error('File delete error:', err);
    });

    res.status(201).json({
      message: '✅ Bulk upload complete!',
      summary: {
        totalRows:  dataRows.length,
        inserted:   insertedCount,
        failed:     failedRows.length,
        assignedTo: assignedAgent ? assignedAgent.name : 'Unassigned',
      },
      failedRows: failedRows.slice(0, 20),
    });

  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: '❌ Server error.', error: err.message });
  }
};

// ─── Exports ───────────────────────────────────────────────
export {
  addLead,
  getAllLeads,
  getMyLeads,
  assignLead,
  updateLeadStatus,
  getLeadById,
  getLeadDetail,
  bulkUpload,
};