import express, { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks with pagination, filtering, and searching
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
    query('search').optional().isString().withMessage('Search must be a string'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        userId: req.userId,
      };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.title = {
          contains: search,
          mode: 'insensitive',
        };
      }

      // Get tasks, total count, and status counts
      const [tasks, total, pendingCount, inProgressCount, completedCount] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: 'PENDING' } }),
        prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      ]);

      res.json({
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statusCounts: {
          pending: pendingCount,
          inProgress: inProgressCount,
          completed: completedCount,
        },
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single task
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, status } = req.body;

      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          status: status || 'PENDING',
          userId: req.userId!,
        },
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update task
router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString(),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, description, status } = req.body;

      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          userId: req.userId,
        },
      });

      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Update task
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      const task = await prisma.task.update({
        where: { id },
        data: updateData,
      });

      res.json(task);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle task status
router.post('/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Determine next status
    let nextStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    if (task.status === 'PENDING') {
      nextStatus = 'IN_PROGRESS';
    } else if (task.status === 'IN_PROGRESS') {
      nextStatus = 'COMPLETED';
    } else {
      nextStatus = 'PENDING';
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: nextStatus },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


