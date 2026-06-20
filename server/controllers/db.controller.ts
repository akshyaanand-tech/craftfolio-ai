import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { toCamelCase, toSnakeCase } from '../utils/case';

const modelMap: Record<string, string> = {
  profiles: 'profile',
  resumes: 'resume',
  portfolios: 'portfolio',
  user_projects: 'portfolioProject',
  skills: 'skill',
  job_applications: 'jobApplication',
  cover_letters: 'coverLetter',
  education: 'education',
  experiences: 'experience',
  career_goals: 'careerGoal',
  settings: 'setting',
  notifications: 'notification',
  resume_versions: 'resumeVersion',
};

const softDeleteModels = ['user', 'profile', 'resume', 'portfolio', 'portfolioProject', 'coverLetter', 'jobApplication'];

export class DBController {
  static async handleQuery(req: AuthenticatedRequest, res: Response) {
    const { table } = req.params;
    const { action, filter, sort, limit, single, payload } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const modelName = modelMap[table];
    if (!modelName) {
      return res.status(400).json({ message: `Unsupported table or model mapping: ${table}` });
    }

    const delegate = (prisma as any)[modelName];
    if (!delegate) {
      return res.status(500).json({ message: `Prisma delegate for ${modelName} not found` });
    }

    try {
      // Build where clause
      const where: any = {};

      // User isolation
      if (modelName === 'user' || modelName === 'profile') {
        where.id = userId;
      } else if (modelName === 'resumeVersion') {
        // Resume versions are filtered by resumeId which is mapped.
        // We will verify ownership if a resumeId filter is present, otherwise scope.
      } else {
        where.userId = userId;
      }

      // Filter mapping
      if (filter) {
        const camelCol = filter.column.replace(/_([a-z])/g, (_: any, letter: string) => letter.toUpperCase());
        where[camelCol] = filter.value;
      }

      // Soft delete check
      if (softDeleteModels.includes(modelName)) {
        where.deletedAt = null;
      }

      let resultData: any = null;

      if (action === 'select') {
        const options: any = { where };

        if (sort) {
          const camelCol = sort.column.replace(/_([a-z])/g, (_: any, letter: string) => letter.toUpperCase());
          options.orderBy = { [camelCol]: sort.ascending ? 'asc' : 'desc' };
        }

        if (limit) {
          options.take = limit;
        }

        if (single) {
          resultData = await delegate.findFirst(options);
        } else {
          resultData = await delegate.findMany(options);
        }
      } else if (action === 'insert') {
        const data = toCamelCase(payload || {});
        
        // Scope insert to current user
        if (modelName === 'profile') {
          data.id = userId;
        } else if (modelName !== 'resumeVersion') {
          data.userId = userId;
        }

        // Special handling for nested structures
        if (data.content && typeof data.content === 'object') {
          data.content = JSON.parse(JSON.stringify(data.content));
        }
        if (data.hero && typeof data.hero === 'object') {
          data.hero = JSON.parse(JSON.stringify(data.hero));
        }
        if (data.sections && typeof data.sections === 'object') {
          data.sections = JSON.parse(JSON.stringify(data.sections));
        }

        resultData = await delegate.create({ data });
      } else if (action === 'update') {
        const data = toCamelCase(payload || {});
        
        // Special handling for json
        if (data.content && typeof data.content === 'object') {
          data.content = JSON.parse(JSON.stringify(data.content));
        }
        if (data.hero && typeof data.hero === 'object') {
          data.hero = JSON.parse(JSON.stringify(data.hero));
        }
        if (data.sections && typeof data.sections === 'object') {
          data.sections = JSON.parse(JSON.stringify(data.sections));
        }

        // Find the record to verify ownership
        const existing = await delegate.findFirst({ where });
        if (!existing) {
          return res.status(404).json({ message: 'Record not found or access denied' });
        }

        resultData = await delegate.update({
          where: { id: existing.id },
          data,
        });
      } else if (action === 'delete') {
        const existing = await delegate.findFirst({ where });
        if (!existing) {
          return res.status(404).json({ message: 'Record not found or access denied' });
        }

        if (softDeleteModels.includes(modelName)) {
          resultData = await delegate.update({
            where: { id: existing.id },
            data: { deletedAt: new Date() },
          });
        } else {
          resultData = await delegate.delete({
            where: { id: existing.id },
          });
        }
      }

      return res.status(200).json({ data: toSnakeCase(resultData) });
    } catch (err: any) {
      console.error(`[DB Error] Table: ${table}, Action: ${action}`, err);
      return res.status(500).json({ message: err.message || 'Database operation failed' });
    }
  }
}
