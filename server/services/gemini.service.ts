import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Cache map
const promptCache = new Map<string, string>();

// Simple rate limiter state
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1000; // Max 1 request per second for safety

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class GeminiService {
  private static async executeWithRetryAndCache(prompt: string, expectJson = false): Promise<string> {
    const cacheKey = `${prompt}_${expectJson}`;
    if (promptCache.has(cacheKey)) {
      return promptCache.get(cacheKey)!;
    }

    if (!genAI) {
      console.warn('[Gemini] GEMINI_API_KEY is not configured. Returning simulated mock AI response.');
      return this.getMockResponse(prompt, expectJson);
    }

    // Rate Limiting
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_INTERVAL_MS) {
      await delay(MIN_INTERVAL_MS - elapsed);
    }
    lastRequestTime = Date.now();

    let retries = 3;
    let backoff = 1000;

    while (retries > 0) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) {
          throw new Error('Empty response received from Gemini');
        }

        promptCache.set(cacheKey, text);
        return text;
      } catch (err: any) {
        retries--;
        console.error(`[Gemini Error] Retries left: ${retries}. Error:`, err.message || err);
        if (retries === 0) {
          throw new Error(`Gemini AI failed after multiple retries: ${err.message}`);
        }
        await delay(backoff);
        backoff *= 2;
      }
    }

    throw new Error('Gemini AI failed');
  }

  static async generateResumeContent(profile: any, role: string): Promise<string> {
    const prompt = `
      You are a professional resume writer.
      Generate a compelling professional summary and 3 bullet points for a resume.
      Target Role: ${role}
      Candidate Profile:
      - Name: ${profile.fullName || 'Professional'}
      - Headline: ${profile.headline || ''}
      - Career Path: ${profile.careerPath || ''}
      
      Respond with plain text formatted with a Summary and Bullet Points.
    `;
    return this.executeWithRetryAndCache(prompt);
  }

  static async generateCoverLetter(profile: any, company: string, role: string): Promise<string> {
    const prompt = `
      You are an expert career consultant.
      Write a professional and personalized cover letter.
      Target Company: ${company}
      Target Role: ${role}
      Candidate Profile:
      - Name: ${profile.fullName || 'Applicant'}
      - Headline: ${profile.headline || ''}
      
      Keep it to 3-4 paragraphs. Format it nicely as a clean plain text cover letter.
    `;
    return this.executeWithRetryAndCache(prompt);
  }

  static async generateATSSuggestions(resumeText: string, jobDescription: string): Promise<{
    score: number;
    missingKeywords: string[];
    suggestions: string[];
  }> {
    const prompt = `
      You are a corporate ATS system scanner and expert recruiter.
      Analyze the resume against the job description below.
      
      Resume text:
      """
      ${resumeText}
      """
      
      Job description:
      """
      ${jobDescription}
      """
      
      Return a JSON object containing:
      {
        "score": (a number between 40 and 100 based on keyword match, structure, and qualifications),
        "missingKeywords": (an array of important keywords from the JD missing in the resume),
        "suggestions": (an array of actionable improvements, e.g. "Add 3 years of React experience")
      }
    `;

    try {
      const responseText = await this.executeWithRetryAndCache(prompt, true);
      return JSON.parse(responseText);
    } catch (err) {
      console.error('[Gemini] JSON parsing failed for ATS report. Returning robust mock data.', err);
      // Fallback
      return {
        score: 78,
        missingKeywords: ['distributed systems', 'observability', 'staff'],
        suggestions: ['Quantify impact in experience bullets', 'Highlight leadership and system design experience']
      };
    }
  }

  static async generatePortfolioContent(profile: any, projects: any[]): Promise<string> {
    const prompt = `
      You are a copywriter for professional portfolios.
      Draft a compelling "About Me" section (around 150 words) that showcases experience, technical expertise, and career aspirations.
      Profile details:
      - Name: ${profile.fullName || ''}
      - Title: ${profile.headline || ''}
      - Projects count: ${projects.length}
      - Project list: ${projects.map(p => p.name).join(', ')}
      
      Write in the first person. Keep it modern, clear, and punchy.
    `;
    return this.executeWithRetryAndCache(prompt);
  }

  static async generateSkillGapSuggestions(company: string, role: string, skills: string[]): Promise<{
    missingSkills: string[];
    roadmap: { step: string; details: string }[];
    technologies: string[];
    projects: { title: string; description: string; tech: string[] }[];
  }> {
    const prompt = `
      You are a technical director and mentor.
      Analyze the skill gap for a candidate targeting:
      Target Company: ${company}
      Target Role: ${role}
      Current Skills: ${skills.join(', ')}
      
      Return a JSON object containing:
      {
        "missingSkills": (an array of 3-5 core technical or power skills missing),
        "roadmap": (an array of objects with "step" and "details" describing a learning path),
        "technologies": (an array of 3-5 tech stacks to learn),
        "projects": (an array of 2 project suggestions with "title", "description", and "tech" array)
      }
    `;

    try {
      const responseText = await this.executeWithRetryAndCache(prompt, true);
      return JSON.parse(responseText);
    } catch (err) {
      console.error('[Gemini] JSON parsing failed for Skill Gap report. Returning mock roadmap.', err);
      return {
        missingSkills: ['System Design', 'Distributed Systems', 'Observability'],
        roadmap: [
          { step: 'Distributed System Basics', details: 'Study CAP theorem, sharding, replication, and consensus protocols.' },
          { step: 'Observability setup', details: 'Learn Prometheus, Grafana, OpenTelemetry, and logging pipelines.' },
        ],
        technologies: ['Apache Kafka', 'Kubernetes', 'Prometheus', 'Redis'],
        projects: [
          { title: 'Distributed Log Aggregator', description: 'Build a distributed pipeline storing and querying real-time system logs.', tech: ['Go', 'Kafka', 'Elasticsearch'] }
        ]
      };
    }
  }

  private static getMockResponse(prompt: string, expectJson: boolean): string {
    if (expectJson) {
      if (prompt.includes('ATS')) {
        return JSON.stringify({
          score: 85,
          missingKeywords: ['distributed systems', 'observability', 'staff'],
          suggestions: ['Add key action verbs in Linear experience', 'Format headers cleanly for ATS scanners']
        });
      }
      if (prompt.includes('skill gap')) {
        return JSON.stringify({
          missingSkills: ['System Design', 'Distributed Systems', 'Observability', 'Team Leadership'],
          roadmap: [
            { step: 'Phase 1: Advanced Frontend & System Design', details: 'Deep dive into micro-frontends, caching layers, and client-side performance.' },
            { step: 'Phase 2: Observability & Orchestration', details: 'Integrate OpenTelemetry metrics and deploy applications on Kubernetes.' },
            { step: 'Phase 3: System Scale & Leadership', details: 'Design distributed databases and mentor junior engineers.' }
          ],
          technologies: ['Kubernetes', 'OpenTelemetry', 'Apache Kafka', 'GraphQL Federation'],
          projects: [
            { title: 'High-Throughput Analytics Dashboard', description: 'Design a system that tracks and logs page interactions at scale using Kafka.', tech: ['TypeScript', 'Kafka', 'React'] },
            { title: 'Micro-Frontend Core shell', description: 'Create a federated shell application dynamically hosting remote micro-apps.', tech: ['React', 'Webpack Federation', 'Docker'] }
          ]
        });
      }
      return '{}';
    }

    if (prompt.includes('resume')) {
      return `Summary:\nHighly skilled developer aiming to deliver exceptional product engineering solutions.\n\nKey accomplishments:\n- Built high-performance React frontends reducing load times by 40%\n- Implemented type-safe Node.js APIs supporting 50k+ active users\n- Streamlined developer experiences via automated CI/CD pipelines.`;
    }
    if (prompt.includes('letter')) {
      return `Dear Hiring Team,\n\nI am thrilled to express my interest in joining your team. My experience matches your requirements closely. I look forward to contributing my technical skills and collaborating on creative software solutions.\n\nSincerely,\nCandidate`;
    }
    if (prompt.includes('About Me')) {
      return `I am a passionate Product Engineer dedicated to building premium web interfaces and scalable backends. With a focus on system performance and developer experience, I turn complex problems into elegant, maintainable applications.`;
    }

    return 'Mock Gemini AI generation successful.';
  }
}
