import { Router } from 'express';
import {
  capture,
  getLeadsList,
  getLead,
  assign,
  updateStatus,
  addNote,
  update,
  deleteLead,
  getActivities,
  importLeadsBulk,
  exportLeadsFiltered
} from './lead.controller.js';
import {
  validateCaptureLead,
  validateUpdateLeadStatus,
  validateAssignLead,
  validateAddNote
} from './lead.validation.js';
import { protect } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';

const router = Router();

/**
 * @openapi
 * /leads/capture:
 *   post:
 *     summary: Public lead capture
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - company
 *               - phone
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@company.com
 *               company:
 *                 type: string
 *                 example: ACME Corp
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               message:
 *                 type: string
 *                 example: Interested in enterprise plan
 *     responses:
 *       201:
 *         description: Lead captured successfully
 */
router.post('/capture', validateCaptureLead, capture);

// Protected routes
router.use(protect);

/**
 * @openapi
 * /leads:
 *   get:
 *     summary: Retrieve leads (Admin see all, Member see assigned only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, lost, won]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 */
router.get('/', getLeadsList);
router.get('/activities', getActivities);
router.post('/import', importLeadsBulk);
router.get('/export', exportLeadsFiltered);

/**
 * @openapi
 * /leads/{id}:
 *   get:
 *     summary: Get lead details with notes and logs
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lead details retrieved successfully
 */
router.route('/:id')
  .get(getLead)
  .put(update)
  .delete(restrictTo('admin'), deleteLead);

/**
 * @openapi
 * /leads/{id}/status:
 *   put:
 *     summary: Update lead status
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, lost, won]
 *                 example: contacted
 *     responses:
 *       200:
 *         description: Lead status updated successfully
 */
router.put('/:id/status', validateUpdateLeadStatus, updateStatus);

/**
 * @openapi
 * /leads/{id}/notes:
 *   post:
 *     summary: Add note to a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 example: Customer called to confirm the meeting time.
 *     responses:
 *       201:
 *         description: Note added successfully
 */
router.post('/:id/notes', validateAddNote, addNote);

/**
 * @openapi
 * /leads/{id}/assign:
 *   put:
 *     summary: Assign a lead to a user (Admin only)
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Lead assigned successfully
 */
router.put('/:id/assign', restrictTo('admin'), validateAssignLead, assign);

export default router;
