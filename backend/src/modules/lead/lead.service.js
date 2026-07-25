import { Op } from 'sequelize';
import { Lead, User, LeadNote, ActivityLog } from '../../database/models/index.js';
import AppError from '../../utils/AppError.js';
import { createNotification } from '../notification/notification.service.js';

export const getLeads = async ({ page = 1, limit = 10, search, status, assignedTo, currentUser }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (currentUser.role === 'member') {
    where.assignedTo = currentUser.id;
  } else if (assignedTo) {
    where.assignedTo = assignedTo;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { company: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Lead.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] }
    ]
  });

  return {
    leads: rows,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: parseInt(page)
  };
};

export const getLeadDetails = async (id, currentUser) => {
  const lead = await Lead.findByPk(id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] },
      { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] },
      {
        model: LeadNote,
        as: 'notes',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }]
      },
      {
        model: ActivityLog,
        as: 'logs',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'role'] }]
      }
    ],
    order: [
      [{ model: LeadNote, as: 'notes' }, 'createdAt', 'DESC'],
      [{ model: ActivityLog, as: 'logs' }, 'createdAt', 'DESC']
    ]
  });

  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }

  if (currentUser.role === 'member' && lead.assignedTo !== currentUser.id) {
    throw new AppError(403, 'You do not have permission to view this lead');
  }

  return lead;
};

export const captureLead = async ({ name, email, company, phone, message }) => {
  const lead = await Lead.create({
    name,
    email,
    company,
    phone,
    message,
    status: 'new'
  });

  const admin = await User.findOne({ where: { role: 'admin' } }) || await User.findOne();
  if (admin) {
    await ActivityLog.create({
      leadId: lead.id,
      userId: admin.id,
      action: 'captured',
      description: `Public lead captured for ${name} from company ${company}`
    });
  }

  // Notify all Admins
  const admins = await User.findAll({ where: { role: 'admin' } });
  for (const adm of admins) {
    await createNotification({
      userId: adm.id,
      leadId: lead.id,
      type: 'lead_created',
      title: 'New Lead Captured',
      message: `Prospect "${name}" from "${company}" has submitted a new inquiry.`
    });
  }

  return lead;
};

export const assignLead = async (leadId, assignedToId, adminUserId) => {
  const lead = await Lead.findByPk(leadId);
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }

  const member = await User.findByPk(assignedToId);
  if (!member) {
    throw new AppError(404, 'Assigned user not found');
  }

  lead.assignedTo = assignedToId;
  await lead.save();

  await ActivityLog.create({
    leadId: lead.id,
    userId: adminUserId,
    action: 'assigned',
    description: `Lead assigned to ${member.name} by Admin`
  });

  const admin = await User.findByPk(adminUserId);
  await createNotification({
    userId: assignedToId,
    leadId: lead.id,
    type: 'lead_assigned',
    title: 'Lead Assigned To You',
    message: `Admin "${admin ? admin.name : 'System'}" has assigned lead "${lead.name}" (${lead.company}) to you.`
  });

  return lead;
};

export const updateLeadStatus = async (leadId, status, userId) => {
  const lead = await Lead.findByPk(leadId);
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }

  const user = await User.findByPk(userId);

  if (user.role === 'member' && lead.assignedTo !== user.id) {
    throw new AppError(403, 'You do not have permission to update this lead');
  }

  const oldStatus = lead.status;
  lead.status = status;
  await lead.save();

  await ActivityLog.create({
    leadId: lead.id,
    userId: user.id,
    action: 'status_updated',
    description: `Status updated from "${oldStatus}" to "${status}"`
  });

  const notifyUserIds = new Set();
  if (lead.assignedTo && lead.assignedTo !== user.id) {
    notifyUserIds.add(lead.assignedTo);
  }

  const admins = await User.findAll({ where: { role: 'admin' } });
  admins.forEach(admin => {
    if (admin.id !== user.id) {
      notifyUserIds.add(admin.id);
    }
  });

  for (const targetId of notifyUserIds) {
    await createNotification({
      userId: targetId,
      leadId: lead.id,
      type: 'status_updated',
      title: 'Lead Status Updated',
      message: `Lead "${lead.name}" (${lead.company}) status updated to "${status}" by ${user.name}.`
    });
  }

  return lead;
};

export const addLeadNote = async (leadId, note, userId) => {
  const lead = await Lead.findByPk(leadId);
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }

  const user = await User.findByPk(userId);

  if (user.role === 'member' && lead.assignedTo !== user.id) {
    throw new AppError(403, 'You do not have permission to add notes to this lead');
  }

  const leadNote = await LeadNote.create({
    leadId,
    userId,
    note
  });

  await ActivityLog.create({
    leadId: lead.id,
    userId,
    action: 'note_added',
    description: `Note added by ${user.name}: "${note.length > 30 ? note.substring(0, 30) + '...' : note}"`
  });

  const notifyUserIds = new Set();
  if (lead.assignedTo && lead.assignedTo !== userId) {
    notifyUserIds.add(lead.assignedTo);
  }

  const admins = await User.findAll({ where: { role: 'admin' } });
  admins.forEach(admin => {
    if (admin.id !== userId) {
      notifyUserIds.add(admin.id);
    }
  });

  for (const targetId of notifyUserIds) {
    await createNotification({
      userId: targetId,
      leadId: lead.id,
      type: 'note_added',
      title: 'New Note Added',
      message: `Agent "${user.name}" added a note to lead "${lead.name}" (${lead.company}).`
    });
  }

  return leadNote;
};

export const deleteLeadByAdmin = async (id) => {
  const lead = await Lead.findByPk(id);
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }
  await lead.destroy();
};

export const updateLeadDetails = async (id, data, user) => {
  const lead = await Lead.findByPk(id);
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }

  if (user.role === 'member' && lead.assignedTo !== user.id) {
    throw new AppError(403, 'You do not have permission to update this lead');
  }

  const { name, email, company, phone, message } = data;
  if (name) lead.name = name;
  if (email) lead.email = email;
  if (company) lead.company = company;
  if (phone) lead.phone = phone;
  if (message) lead.message = message;

  await lead.save();

  await ActivityLog.create({
    leadId: lead.id,
    userId: user.id,
    action: 'updated',
    description: `Lead details updated by ${user.name}`
  });

  return lead;
};

export const getRecentActivities = async (currentUser) => {
  const where = {};
  if (currentUser.role === 'member') {
    const userLeads = await Lead.findAll({
      where: { assignedTo: currentUser.id },
      attributes: ['id']
    });
    const leadIds = userLeads.map(l => l.id);
    where.leadId = { [Op.in]: leadIds };
  }

  return await ActivityLog.findAll({
    where,
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'role'] },
      { model: Lead, as: 'lead', attributes: ['id', 'name', 'company'] }
    ]
  });
};

export const parseCSV = (text) => {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',') {
      if (inQuotes) {
        row[row.length - 1] += c;
      } else {
        row.push("");
      }
    } else if (c === '\r' || c === '\n') {
      if (inQuotes) {
        row[row.length - 1] += c;
      } else {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      }
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
};

export const importLeads = async (csvText, adminUserId) => {
  const parsed = parseCSV(csvText);
  if (parsed.length < 2) {
    throw new AppError(400, 'Empty CSV or header row only');
  }

  const headers = parsed[0].map(h => h.trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const emailIdx = headers.indexOf('email');
  const companyIdx = headers.indexOf('company');
  const phoneIdx = headers.indexOf('phone');
  const messageIdx = headers.indexOf('message');

  if (nameIdx === -1 || emailIdx === -1 || companyIdx === -1) {
    throw new AppError(400, 'CSV must contain Name, Email, and Company headers');
  }

  const summary = {
    total: parsed.length - 1,
    success: 0,
    duplicates: 0,
    invalid: 0,
    errors: []
  };

  const leadsToCreate = [];

  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    if (row.length < 3 || row.every(cell => !cell.trim())) {
      continue; // skip empty rows
    }

    const name = row[nameIdx]?.trim();
    const email = row[emailIdx]?.trim();
    const company = row[companyIdx]?.trim();
    const phone = phoneIdx !== -1 ? row[phoneIdx]?.trim() : '';
    const message = messageIdx !== -1 ? row[messageIdx]?.trim() : 'CSV Import';

    if (!name || !email || !company) {
      summary.invalid++;
      summary.errors.push(`Row ${i + 1}: Name, Email, and Company are required`);
      continue;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      summary.invalid++;
      summary.errors.push(`Row ${i + 1}: Invalid email format "${email}"`);
      continue;
    }

    const existing = await Lead.findOne({ where: { email } });
    if (existing) {
      summary.duplicates++;
      summary.errors.push(`Row ${i + 1}: Duplicate email exists in CRM ("${email}")`);
      continue;
    }

    leadsToCreate.push({ name, email, company, phone, message });
  }

  for (const item of leadsToCreate) {
    const lead = await Lead.create({
      ...item,
      status: 'new',
      createdBy: adminUserId
    });
    
    await ActivityLog.create({
      leadId: lead.id,
      userId: adminUserId,
      action: 'imported',
      description: `Lead bulk imported from CSV`
    });

    summary.success++;
  }

  return summary;
};

export const exportLeadsToCSV = async (leadsList) => {
  const headers = ['id', 'name', 'email', 'company', 'phone', 'message', 'status', 'createdAt'];
  const rows = leadsList.map(lead => [
    lead.id,
    `"${lead.name.replace(/"/g, '""')}"`,
    lead.email,
    `"${lead.company.replace(/"/g, '""')}"`,
    `"${(lead.phone || '').replace(/"/g, '""')}"`,
    `"${(lead.message || '').replace(/"/g, '""')}"`,
    lead.status,
    lead.createdAt
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
