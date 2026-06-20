import { Response } from 'express';
import { ATSService } from '../services/ats.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { toSnakeCase } from '../utils/case';

export class ATSController {
  static async analyze(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    const { resumeId, jobDescription, resumeText } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!jobDescription || (!resumeId && !resumeText)) {
      return res.status(400).json({ message: 'Job description and either a resume ID or resume text are required' });
    }

    try {
      const report = await ATSService.analyze(userId, resumeId, jobDescription, resumeText);
      return res.status(200).json(toSnakeCase(report));
    } catch (err: any) {
      console.error('[ATS Controller Error]', err);
      return res.status(500).json({ message: err.message || 'ATS analysis failed' });
    }
  }
}
