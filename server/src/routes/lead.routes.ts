import { Router } from 'express';
import * as leadController from '../controllers/lead.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  getLeadsQuerySchema,
  leadIdParamSchema,
} from '../schemas/lead.schema.js';

const router = Router();

// Metric KPI Counts (must be before /:id)
router.get('/stats', leadController.getLeadStats);

// List leads with search, filter, pagination, sorting
router.get('/', validateRequest(getLeadsQuerySchema), leadController.getLeads);

// Get single lead by ID
router.get('/:id', validateRequest(leadIdParamSchema), leadController.getLeadById);

// Create new lead
router.post('/', validateRequest(createLeadSchema), leadController.createLead);

// Full / partial update of a lead
router.put('/:id', validateRequest(updateLeadSchema), leadController.updateLead);

// Quick status update
router.patch('/:id/status', validateRequest(updateStatusSchema), leadController.updateLeadStatus);

// Delete lead
router.delete('/:id', validateRequest(leadIdParamSchema), leadController.deleteLead);

export default router;
