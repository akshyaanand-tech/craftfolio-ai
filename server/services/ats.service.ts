import { prisma } from '../config/db';
import { GeminiService } from './gemini.service';

export class ATSService {
  static async analyze(userId: string, resumeId: string | undefined, jobDescription: string, resumeText?: string) {
    let fullResumeText = '';
    let activeResumeId = resumeId || '';
    let experiencesText = '';
    let skillsText = '';
    let summaryText = '';
    let contactText = '';

    if (resumeId) {
      // 1. Fetch Resume
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId, deletedAt: null }
      });

      if (!resume) {
        throw new Error('Resume not found or access denied');
      }

      // 2. Extract plain text from Resume JSON
      const content = resume.content as any;
      skillsText = Array.isArray(content?.skills) ? content.skills.join(', ') : '';
      experiencesText = Array.isArray(content?.workHistory)
        ? content.workHistory.map((w: any) => `${w.company} ${w.position} ${w.description || ''}`).join('\n')
        : '';
      summaryText = content?.summary || '';
      contactText = `${content?.contact?.email || ''} ${content?.contact?.phone || ''} ${content?.contact?.link || ''}`;
      
      fullResumeText = `
        Title: ${resume.title}
        Summary: ${summaryText}
        Contact: ${contactText}
        Skills: ${skillsText}
        Experience:
        ${experiencesText}
      `;
    } else if (resumeText) {
      fullResumeText = resumeText;
      
      // Auto-extract basic experience / skills / contact for the local heuristics
      skillsText = resumeText;
      experiencesText = resumeText;
      summaryText = resumeText;
      contactText = resumeText;

      // Find or create a default resume for this user to associate the report
      let defaultResume = await prisma.resume.findFirst({
        where: { userId, deletedAt: null }
      });
      if (!defaultResume) {
        defaultResume = await prisma.resume.create({
          data: {
            userId,
            title: 'My Imported Resume',
            content: { summary: resumeText }
          }
        });
      }
      activeResumeId = defaultResume.id;
    } else {
      throw new Error('Either resumeId or resumeText is required');
    }

    // 3. Local Heuristic Analysis (30% weight)
    let localScore = 100;
    const localSuggestions: string[] = [];

    // Check contact info
    const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailRegex.test(contactText) || emailRegex.test(summaryText);
    if (!hasEmail) {
      localScore -= 15;
      localSuggestions.push('Add an email address to your contact information');
    }

    // Check structure (experience & skills & education)
    if (!experiencesText || experiencesText.length < 50) {
      localScore -= 20;
      localSuggestions.push('Add more details to your professional experience section');
    }
    if (!skillsText) {
      localScore -= 15;
      localSuggestions.push('Add a dedicated skills section to your resume');
    }

    // Check JD keyword overlap
    const jdKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(fullResumeText);
    const missingLocalKeywords: string[] = [];

    jdKeywords.forEach(kw => {
      if (!resumeKeywords.has(kw)) {
        missingLocalKeywords.push(kw);
      }
    });

    // Score based on keyword overlap
    if (jdKeywords.size > 0) {
      const matchRate = (jdKeywords.size - missingLocalKeywords.length) / jdKeywords.size;
      localScore -= Math.round((1 - matchRate) * 30);
    }
    localScore = Math.max(0, localScore);

    // 4. Gemini Semantic Analysis (70% weight)
    const geminiReport = await GeminiService.generateATSSuggestions(fullResumeText, jobDescription);

    // 5. Combine scores
    const finalScore = Math.round((localScore * 0.3) + (geminiReport.score * 0.7));
    const combinedSuggestions = Array.from(new Set([...localSuggestions, ...geminiReport.suggestions]));
    const combinedKeywords = Array.from(new Set([...missingLocalKeywords.slice(0, 5), ...geminiReport.missingKeywords]));

    // 6. Save ATS Report
    const report = await prisma.atsReport.create({
      data: {
        userId,
        resumeId: activeResumeId,
        jobDescription,
        score: finalScore,
        missingKeywords: combinedKeywords,
        feedback: JSON.parse(JSON.stringify({
          suggestions: combinedSuggestions,
          localScore,
          geminiScore: geminiReport.score
        }))
      }
    });

    return report;
  }

  private static extractKeywords(text: string): Set<string> {
    const ignored = new Set([
      'the', 'and', 'a', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'by', 'an', 'is', 'your', 'our', 'their', 'we', 'you',
      'this', 'that', 'from', 'it', 'its', 'are', 'be', 'as', 'or', 'an', 'with', 'about', 'more', 'how', 'what', 'which'
    ]);
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/);

    const keywords = new Set<string>();
    words.forEach(w => {
      if (w.length > 2 && !ignored.has(w)) {
        keywords.add(w);
      }
    });
    return keywords;
  }
}
