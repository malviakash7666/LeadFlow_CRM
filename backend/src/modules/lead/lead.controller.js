import {
  captureLead,
  getLeads,
  getLeadDetails,
  assignLead,
  updateLeadStatus,
  addLeadNote,
  updateLeadDetails,
  deleteLeadByAdmin,
  getRecentActivities,
  importLeads,
  exportLeadsToCSV
} from './lead.service.js';

export const capture = async (req, res, next) => {
  try {
    const { name, email, company, phone, message } = req.body;
    const lead = await captureLead({ name, email, company, phone, message });

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadsList = async (req, res, next) => {
  try {
    const { page, limit, search, status, assignedTo } = req.query;
    const result = await getLeads({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      status,
      assignedTo,
      currentUser: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req, res, next) => {
  try {
    const lead = await getLeadDetails(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Lead details retrieved successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const assign = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const lead = await assignLead(req.params.id, assignedTo, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Lead assigned successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const lead = await updateLeadStatus(req.params.id, status, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const leadNote = await addLeadNote(req.params.id, note, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Note added to lead successfully',
      data: leadNote
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const lead = await updateLeadDetails(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Lead details updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    await deleteLeadByAdmin(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req, res, next) => {
  try {
    const logs = await getRecentActivities(req.user);
    res.status(200).json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

export const importLeadsBulk = async (req, res, next) => {
  try {
    const { csvText } = req.body;
    if (!csvText) {
      return res.status(400).json({
        success: false,
        message: 'csvText is required in request body'
      });
    }

    const summary = await importLeads(csvText, req.user.id);
    res.status(200).json({
      success: true,
      message: 'CSV import processed',
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsFiltered = async (req, res, next) => {
  try {
    const { search, status, assignedTo } = req.query;
    const result = await getLeads({
      page: 1,
      limit: 100000,
      search,
      status,
      assignedTo,
      currentUser: req.user
    });

    const csvContent = await exportLeadsToCSV(result.leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
