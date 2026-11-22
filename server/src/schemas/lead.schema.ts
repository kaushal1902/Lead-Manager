import { z } from 'zod';
import { LeadStatus, LeadSource } from '@prisma/client';

export const createLeadSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    company: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    source: z
      .nativeEnum(LeadSource, {
        errorMap: () => ({ message: 'Invalid lead source' }),
      })
      .default(LeadSource.Website),
    status: z
      .nativeEnum(LeadStatus, {
        errorMap: () => ({ message: 'Invalid lead status' }),
      })
      .default(LeadStatus.New),
    notes: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .optional(),
    phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    company: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    source: z.nativeEnum(LeadSource).optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    notes: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(LeadStatus, {
      errorMap: (issue) => {
        if (issue.code === 'invalid_type') {
          return { message: 'Status is required' };
        }
        return { message: 'Invalid lead status. Must be New, Contacted, Qualified, or Lost' };
      },
    }),
  }),
});

export const getLeadsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    sortBy: z.enum(['createdAt', 'name', 'status', 'company']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const leadIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
});
