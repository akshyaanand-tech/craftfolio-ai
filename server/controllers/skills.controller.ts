import { Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { toSnakeCase } from '../utils/case';

export class SkillsController {
  static async getGapReport(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    const { company, role, currentSkills } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!company || !role) {
      return res.status(400).json({ message: 'Target company and role are required' });
    }

    try {
      const skillsArr = Array.isArray(currentSkills)
        ? currentSkills
        : typeof currentSkills === 'string'
        ? currentSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const result = await GeminiService.generateSkillGapSuggestions(company, role, skillsArr);

      // Save report to database
      const report = await prisma.skillGapReport.create({
        data: {
          userId,
          targetCompany: company,
          targetRole: role,
          currentSkills: skillsArr.join(', '),
          missingSkills: result.missingSkills,
          roadmap: JSON.parse(JSON.stringify(result.roadmap)),
          technologies: result.technologies,
          projects: JSON.parse(JSON.stringify(result.projects))
        }
      });

      return res.status(200).json(toSnakeCase(report));
    } catch (err: any) {
      console.error('[Skills Gap Controller Error]', err);
      return res.status(500).json({ message: err.message || 'Skill gap analysis failed' });
    }
  }
}
