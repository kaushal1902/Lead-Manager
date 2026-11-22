import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../errors/ApiError.js';
import { LeadStatus, LeadSource, Prisma } from '@prisma/client';

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      status,
      source,
      sortBy = 'createdAt',
      order = 'desc',
      page,
      limit,
    } = req.query as {
      search?: string;
      status?: LeadStatus;
      source?: LeadSource;
      sortBy?: 'createdAt' | 'name' | 'status' | 'company';
      order?: 'asc' | 'desc';
      page?: string;
      limit?: string;
    };

    const where: Prisma.LeadWhereInput = {};

    // Multi-tenant user isolation: If user is logged in, show only their leads
    if (req.user) {
      where.userId = req.user.id;
    }

    // Multi-field search (name, email, company)
    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { company: { contains: query } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Source filter
    if (source) {
      where.source = source;
    }

    // Sorting
    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const total = await prisma.lead.count({ where });

    // Pagination
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : null;
    const limitNum = limit && limit !== 'all' ? Math.max(1, parseInt(limit, 10) || 10) : null;

    let leads;
    if (pageNum && limitNum) {
      const skip = (pageNum - 1) * limitNum;
      leads = await prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      });

      return res.status(200).json({
        success: true,
        data: leads,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    }

    leads = await prisma.lead.findMany({
      where,
      orderBy,
    });

    return res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: 1,
        limit: total,
        totalPages: 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userScope: Prisma.LeadWhereInput = req.user ? { userId: req.user.id } : {};

    const [total, newCount, contactedCount, qualifiedCount, lostCount] = await Promise.all([
      prisma.lead.count({ where: userScope }),
      prisma.lead.count({ where: { ...userScope, status: LeadStatus.New } }),
      prisma.lead.count({ where: { ...userScope, status: LeadStatus.Contacted } }),
      prisma.lead.count({ where: { ...userScope, status: LeadStatus.Qualified } }),
      prisma.lead.count({ where: { ...userScope, status: LeadStatus.Lost } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        new: newCount,
        contacted: contactedCount,
        qualified: qualifiedCount,
        lost: lostCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw ApiError.notFound(`Lead with ID '${id}' was not found`);
    }

    // Verify ownership if user is logged in
    if (req.user && lead.userId && lead.userId !== req.user.id) {
      throw new ApiError(403, 'Forbidden: You do not have access to this lead.', 'FORBIDDEN');
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Require authentication to create leads
    if (!req.user) {
      throw new ApiError(401, 'Authentication required: Please sign in to add a new lead.', 'UNAUTHORIZED');
    }

    const { name, email, phone, company, source, status, notes } = req.body;

    const newLead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source,
        status,
        notes,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Require authentication to edit leads
    if (!req.user) {
      throw new ApiError(401, 'Authentication required: Please sign in to edit this lead.', 'UNAUTHORIZED');
    }

    const id = req.params.id as string;
    const { name, email, phone, company, source, status, notes } = req.body;

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw ApiError.notFound(`Cannot update: Lead with ID '${id}' was not found`);
    }

    if (existingLead.userId && existingLead.userId !== req.user.id) {
      throw new ApiError(403, 'Forbidden: You do not have permission to update this lead.', 'FORBIDDEN');
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(source !== undefined && { source }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Require authentication to update status
    if (!req.user) {
      throw new ApiError(401, 'Authentication required: Please sign in to update lead status.', 'UNAUTHORIZED');
    }

    const id = req.params.id as string;
    const { status } = req.body;

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw ApiError.notFound(`Cannot update status: Lead with ID '${id}' was not found`);
    }

    if (existingLead.userId && existingLead.userId !== req.user.id) {
      throw new ApiError(403, 'Forbidden: You do not have permission to update this lead.', 'FORBIDDEN');
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}`,
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Require authentication to delete leads
    if (!req.user) {
      throw new ApiError(401, 'Authentication required: Please sign in to delete this lead.', 'UNAUTHORIZED');
    }

    const id = req.params.id as string;

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw ApiError.notFound(`Cannot delete: Lead with ID '${id}' was not found`);
    }

    if (existingLead.userId && existingLead.userId !== req.user.id) {
      throw new ApiError(403, 'Forbidden: You do not have permission to delete this lead.', 'FORBIDDEN');
    }

    await prisma.lead.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
