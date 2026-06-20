import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Printer, Sparkles, Plus, Trash2, Layout, BookOpen, User, Briefcase, Award } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/resumes/$id")({
  head: () => ({ meta: [{ title: "Resume Builder — Craftfolio AI" }] }),
  component: ResumeBuilderPage,
});

interface ResumeContact {
  email?: string;
  phone?: string;
  link?: string;
  location?: string;
}

interface WorkHistory {
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Education {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

interface ResumeContent {
  summary?: string;
  contact?: ResumeContact;
  skills?: string[];
  workHistory?: WorkHistory[];
  education?: Education[];
}

function ResumeBuilderPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch Resume Data
  const { data: resume, isLoading, error } = useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const res = await supabase.from("resumes").select("*").eq("id", id).single();
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  // State Management
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("modern");
  const [content, setContent] = useState<ResumeContent>({
    summary: "",
    contact: { email: "", phone: "", link: "", location: "" },
    skills: [],
    workHistory: [],
    education: [],
  });

  // Skills input helper
  const [skillsText, setSkillsText] = useState("");

  // ATS State
  const [jd, setJd] = useState("");
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsReport, setAtsReport] = useState<any>(null);

  // Initialize form state once loaded
  useEffect(() => {
    if (resume) {
      setTitle(resume.title || "");
      setTemplate(resume.template || "modern");
      
      const parsedContent = (typeof resume.content === "string" 
        ? JSON.parse(resume.content) 
        : resume.content) || {};
        
      const normalizedContent: ResumeContent = {
        summary: parsedContent.summary || "",
        contact: parsedContent.contact || { email: "", phone: "", link: "", location: "" },
        skills: Array.isArray(parsedContent.skills) ? parsedContent.skills : [],
        workHistory: Array.isArray(parsedContent.workHistory) ? parsedContent.workHistory : [],
        education: Array.isArray(parsedContent.education) ? parsedContent.education : [],
      };
      
      setContent(normalizedContent);
      setSkillsText(normalizedContent.skills.join(", "));
    }
  }, [resume]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading builder…</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error loading resume: {error.message}</div>;

  // Handle Updates
  const save = async (silent = false) => {
    try {
      const updatedContent = {
        ...content,
        skills: skillsText.split(",").map(s => s.trim()).filter(Boolean),
      };

      const { error } = await supabase
        .from("resumes")
        .update({
          title,
          template,
          content: updatedContent,
        })
        .eq("id", id);

      if (error) throw error;
      if (!silent) toast.success("Resume saved successfully!");
      qc.invalidateQueries({ queryKey: ["resume", id] });
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save resume");
    }
  };

  // Auto-save helpers
  const handleContentBlur = () => {
    save(true);
  };

  // Helper arrays
  const addWork = () => {
    setContent(c => ({
      ...c,
      workHistory: [...(c.workHistory || []), { company: "", position: "", location: "", startDate: "", endDate: "", description: "" }]
    }));
  };

  const removeWork = (idx: number) => {
    setContent(c => ({
      ...c,
      workHistory: (c.workHistory || []).filter((_, i) => i !== idx)
    }));
  };

  const updateWork = (idx: number, patch: Partial<WorkHistory>) => {
    setContent(c => {
      const copy = [...(c.workHistory || [])];
      copy[idx] = { ...copy[idx], ...patch };
      return { ...c, workHistory: copy };
    });
  };

  const addEdu = () => {
    setContent(c => ({
      ...c,
      education: [...(c.education || []), { school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }]
    }));
  };

  const removeEdu = (idx: number) => {
    setContent(c => ({
      ...c,
      education: (c.education || []).filter((_, i) => i !== idx)
    }));
  };

  const updateEdu = (idx: number, patch: Partial<Education>) => {
    setContent(c => {
      const copy = [...(c.education || [])];
      copy[idx] = { ...copy[idx], ...patch };
      return { ...c, education: copy };
    });
  };

  // ATS scanner
  const scanAts = async () => {
    if (!jd) return toast.error("Please paste a job description first");
    setAtsLoading(true);
    setAtsReport(null);
    try {
      // Trigger a save first to ensure backend scans the latest version
      const updatedContent = {
        ...content,
        skills: skillsText.split(",").map(s => s.trim()).filter(Boolean),
      };

      await supabase
        .from("resumes")
        .update({ title, template, content: updatedContent })
        .eq("id", id);

      const res = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("cf-access-token") || ""}`,
        },
        body: JSON.stringify({
          resumeId: id,
          jobDescription: jd,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ATS analysis failed");
      setAtsReport(data);
      toast.success("ATS Analysis completed!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred during scanning");
    } finally {
      setAtsLoading(false);
    }
  };

  // Native PDF print saving
  const downloadPdf = async () => {
    await save(true);
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground print:bg-white print:text-black">
      {/* Print Stylesheet Inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything except the resume container */
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}} />

      {/* Editor Header */}
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 sticky top-0 bg-background/95 backdrop-blur z-20 print:hidden">
        <div className="flex items-center gap-4 flex-1">
          <Button asChild variant="ghost" size="icon">
            <Link to="/resumes"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex flex-col max-w-sm flex-1">
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              onBlur={handleContentBlur}
              className="font-display font-semibold text-lg border-0 px-0 h-8 focus-visible:ring-0 focus-visible:border-b focus-visible:border-primary focus-visible:rounded-none" 
              placeholder="Resume Title" 
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <Layout className="h-3.5 w-3.5" />
            Template:
            <Select value={template} onValueChange={(val) => { setTemplate(val); setTimeout(() => save(true), 50); }}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={() => save(false)}>
            <Save className="mr-1.5 h-4 w-4" /> Save
          </Button>
          <Button size="sm" onClick={downloadPdf}>
            <Printer className="mr-1.5 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </header>

      {/* Main Workspace Split Pane */}
      <div className="flex-1 grid lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_640px] print:grid-cols-1">
        {/* Left Pane: Controls Editor */}
        <div className="border-r border-border/60 bg-muted/20 p-6 overflow-y-auto max-h-[calc(100vh-73px)] print:hidden">
          <Tabs defaultValue="basics" className="w-full space-y-6">
            <TabsList className="grid grid-cols-5 w-full bg-background border border-border/60 p-1">
              <TabsTrigger value="basics" className="text-xs flex gap-1"><User className="h-3 w-3" /> Basics</TabsTrigger>
              <TabsTrigger value="work" className="text-xs flex gap-1"><Briefcase className="h-3 w-3" /> Work</TabsTrigger>
              <TabsTrigger value="edu" className="text-xs flex gap-1"><BookOpen className="h-3 w-3" /> Edu</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs flex gap-1"><Award className="h-3 w-3" /> Skills</TabsTrigger>
              <TabsTrigger value="ats" className="text-xs flex gap-1 text-primary"><Sparkles className="h-3 w-3" /> ATS</TabsTrigger>
            </TabsList>

            {/* TAB: Basics */}
            <TabsContent value="basics" className="space-y-4">
              <Card className="p-6 border-border/60 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5"><User className="h-4 w-4 text-primary" /> Contact Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-email">Email</Label>
                    <Input 
                      id="c-email" 
                      value={content.contact?.email || ""} 
                      onChange={e => setContent(c => ({ ...c, contact: { ...c.contact, email: e.target.value } }))}
                      onBlur={handleContentBlur}
                      placeholder="email@example.com" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-phone">Phone</Label>
                    <Input 
                      id="c-phone" 
                      value={content.contact?.phone || ""} 
                      onChange={e => setContent(c => ({ ...c, contact: { ...c.contact, phone: e.target.value } }))}
                      onBlur={handleContentBlur}
                      placeholder="+1 (555) 019-2834" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-link">Website / LinkedIn</Label>
                    <Input 
                      id="c-link" 
                      value={content.contact?.link || ""} 
                      onChange={e => setContent(c => ({ ...c, contact: { ...c.contact, link: e.target.value } }))}
                      onBlur={handleContentBlur}
                      placeholder="linkedin.com/in/username" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-loc">Location</Label>
                    <Input 
                      id="c-loc" 
                      value={content.contact?.location || ""} 
                      onChange={e => setContent(c => ({ ...c, contact: { ...c.contact, location: e.target.value } }))}
                      onBlur={handleContentBlur}
                      placeholder="San Francisco, CA" 
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border/60 space-y-4">
                <h3 className="text-sm font-semibold">Professional Summary</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="c-sum">Write a short statement detailing your experience and goals</Label>
                  <Textarea 
                    id="c-sum" 
                    rows={6}
                    value={content.summary || ""} 
                    onChange={e => setContent(c => ({ ...c, summary: e.target.value }))}
                    onBlur={handleContentBlur}
                    placeholder="Result-oriented Software Engineer with 5+ years of experience designing scalable microservices..." 
                  />
                </div>
              </Card>
            </TabsContent>

            {/* TAB: Work Experience */}
            <TabsContent value="work" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">Work History</h3>
                <Button size="xs" onClick={addWork} className="text-xs"><Plus className="mr-1 h-3.5 w-3.5" /> Add Job</Button>
              </div>

              {content.workHistory?.map((w, idx) => (
                <Card key={idx} className="p-6 border-border/60 relative space-y-4 animate-in fade-in-50 duration-200">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeWork(idx)} 
                    className="absolute right-3 top-3 h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Company</Label>
                      <Input 
                        value={w.company} 
                        onChange={e => updateWork(idx, { company: e.target.value })}
                        onBlur={handleContentBlur}
                        placeholder="Acme Corp" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Position</Label>
                      <Input 
                        value={w.position} 
                        onChange={e => updateWork(idx, { position: e.target.value })}
                        onBlur={handleContentBlur}
                        placeholder="Staff Software Engineer" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Location</Label>
                      <Input 
                        value={w.location || ""} 
                        onChange={e => updateWork(idx, { location: e.target.value })}
                        onBlur={handleContentBlur}
                        placeholder="Remote / New York" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label>Start Date</Label>
                        <Input 
                          value={w.startDate || ""} 
                          onChange={e => updateWork(idx, { startDate: e.target.value })}
                          onBlur={handleContentBlur}
                          placeholder="Jan 2022" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Date</Label>
                        <Input 
                          value={w.endDate || ""} 
                          onChange={e => updateWork(idx, { endDate: e.target.value })}
                          onBlur={handleContentBlur}
                          placeholder="Present" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Roles & Accomplishments</Label>
                    <Textarea 
                      rows={4}
                      value={w.description || ""} 
                      onChange={e => updateWork(idx, { description: e.target.value })}
                      onBlur={handleContentBlur}
                      placeholder="- Designed cloud architectures using Node.js, Kafka, and PostgreSQL.&#10;- Led a team of 4 engineers to rebuild checkout flow, improving conversion by 12%." 
                    />
                  </div>
                </Card>
              ))}

              {(!content.workHistory || content.workHistory.length === 0) && (
                <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No experience items listed. Click "Add Job" to record your history.
                </div>
              )}
            </TabsContent>

            {/* TAB: Education */}
            <TabsContent value="edu" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-muted-foreground">Education</h3>
                <Button size="xs" onClick={addEdu} className="text-xs"><Plus className="mr-1 h-3.5 w-3.5" /> Add Education</Button>
              </div>

              {content.education?.map((e, idx) => (
                <Card key={idx} className="p-6 border-border/60 relative space-y-4 animate-in fade-in-50 duration-200">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeEdu(idx)} 
                    className="absolute right-3 top-3 h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>School</Label>
                      <Input 
                        value={e.school} 
                        onChange={e => updateEdu(idx, { school: e.target.value })}
                        onBlur={handleContentBlur}
                        placeholder="University of California, Berkeley" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Degree</Label>
                      <Input 
                        value={e.degree || ""} 
                        onChange={e => updateEdu(idx, { degree: e.target.value })}
                        onBlur={handleContentBlur}
                        placeholder="B.S. or M.S." 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Field of Study</Label>
                      <Input 
                        value={e.field || ""} 
                        onChange={e => updateEdu(idx, { field: e.target.value })}
                        onBlur={handleContentBlur}
                        placeholder="Computer Science" 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="space-y-1.5 col-span-1">
                        <Label>GPA</Label>
                        <Input 
                          value={e.gpa || ""} 
                          onChange={e => updateEdu(idx, { gpa: e.target.value })}
                          onBlur={handleContentBlur}
                          placeholder="3.8" 
                        />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <Label>Start</Label>
                        <Input 
                          value={e.startDate || ""} 
                          onChange={e => updateEdu(idx, { startDate: e.target.value })}
                          onBlur={handleContentBlur}
                          placeholder="2018" 
                        />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <Label>End</Label>
                        <Input 
                          value={e.endDate || ""} 
                          onChange={e => updateEdu(idx, { endDate: e.target.value })}
                          onBlur={handleContentBlur}
                          placeholder="2022" 
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {(!content.education || content.education.length === 0) && (
                <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  No education items listed. Click "Add Education" to record.
                </div>
              )}
            </TabsContent>

            {/* TAB: Skills */}
            <TabsContent value="skills" className="space-y-4">
              <Card className="p-6 border-border/60 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> Key Skills</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="c-skills">List your technical skills separated by commas</Label>
                  <Input 
                    id="c-skills" 
                    value={skillsText} 
                    onChange={e => setSkillsText(e.target.value)}
                    onBlur={handleContentBlur}
                    placeholder="React, Node.js, TypeScript, PostgreSQL, Docker, AWS" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Example: React, TypeScript, GraphQL, AWS CloudFormation</p>
                </div>
              </Card>
            </TabsContent>

            {/* TAB: ATS Scanner */}
            <TabsContent value="ats" className="space-y-4">
              <Card className="p-6 border-border/60 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4" /> ATS Optimization Scanner
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste the target job description below and run a scan to get suggestions for keyword matching and layout improvements based on AI.
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="ats-jd">Paste Job Description</Label>
                  <Textarea 
                    id="ats-jd"
                    rows={8}
                    value={jd}
                    onChange={e => setJd(e.target.value)}
                    placeholder="We are looking for a Senior Developer with 5+ years of experience in React, TypeScript, Node.js..."
                  />
                </div>

                <Button onClick={scanAts} disabled={atsLoading || !jd} className="w-full flex gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {atsLoading ? "Scanning Resume..." : "Run ATS Score Scan"}
                </Button>
              </Card>

              {atsReport && (
                <Card className="p-6 border-border/60 bg-gradient-to-br from-card to-background space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-semibold">Scan Analysis</h4>
                      <p className="text-xs text-muted-foreground">Resume vs Target Description</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-display font-bold text-primary">{atsReport.score}%</div>
                      <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">ATS Score</div>
                    </div>
                  </div>

                  {atsReport.missing_keywords && atsReport.missing_keywords.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-amber-500">Missing Key Terms</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {atsReport.missing_keywords.map((kw: string, idx: number) => (
                          <span key={idx} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {atsReport.feedback?.suggestions && atsReport.feedback.suggestions.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">Key Recommendations</Label>
                      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                        {atsReport.feedback.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Pane: Live Premium PDF Preview */}
        <div className="flex justify-center bg-zinc-800 p-8 overflow-y-auto max-h-[calc(100vh-73px)] print:bg-white print:p-0 print:overflow-visible">
          <div 
            id="print-area" 
            ref={printRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-zinc-900 shadow-xl border border-zinc-700/20 p-12 transition-all duration-300 print:shadow-none print:border-0 print:w-full print:p-12 ${
              template === "classic" ? "font-serif" : "font-sans"
            }`}
          >
            {/* Template 1: MODERN */}
            {template === "modern" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b-2 border-zinc-900 pb-4">
                  <h1 className="text-3xl font-bold tracking-tight font-display text-zinc-950 uppercase">{title || "Professional Resume"}</h1>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                    {content.contact?.email && <span>Email: {content.contact.email}</span>}
                    {content.contact?.phone && <span>Phone: {content.contact.phone}</span>}
                    {content.contact?.link && <span>Web: {content.contact.link}</span>}
                    {content.contact?.location && <span>Location: {content.contact.location}</span>}
                  </div>
                </div>

                {/* Summary */}
                {content.summary && (
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Summary</h2>
                    <p className="text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap">{content.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {content.workHistory && content.workHistory.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1">Experience</h2>
                    <div className="space-y-4">
                      {content.workHistory.map((w, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-zinc-950">{w.position} @ {w.company}</span>
                            <span className="text-[10px] text-zinc-500 font-semibold">{w.startDate} — {w.endDate}</span>
                          </div>
                          {w.location && <div className="text-[10px] text-zinc-500 italic">{w.location}</div>}
                          {w.description && (
                            <p className="text-[11px] leading-relaxed text-zinc-700 whitespace-pre-wrap">{w.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {content.education && content.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1">Education</h2>
                    <div className="space-y-3">
                      {content.education.map((e, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-zinc-950">{e.school}</span>
                            <span className="text-[10px] text-zinc-500 font-semibold">{e.startDate} — {e.endDate}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-600">
                            <span>{e.degree} {e.field ? `in ${e.field}` : ""}</span>
                            {e.gpa && <span>GPA: {e.gpa}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skillsText && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1">Skills</h2>
                    <p className="text-[11px] leading-relaxed text-zinc-700">
                      {skillsText.split(",").map(s => s.trim()).filter(Boolean).join("  ·  ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Template 2: CLASSIC */}
            {template === "classic" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-semibold tracking-wide font-serif text-zinc-950">{title || "Professional Resume"}</h1>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-600 italic">
                    {content.contact?.email && <span>{content.contact.email}</span>}
                    {content.contact?.phone && <span>{content.contact.phone}</span>}
                    {content.contact?.link && <span>{content.contact.link}</span>}
                    {content.contact?.location && <span>{content.contact.location}</span>}
                  </div>
                  <div className="h-px bg-zinc-300 w-full mt-3" />
                </div>

                {/* Summary */}
                {content.summary && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 text-center">Professional Summary</h2>
                    <p className="text-xs leading-relaxed text-zinc-700 text-justify whitespace-pre-wrap">{content.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {content.workHistory && content.workHistory.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-300 pb-0.5">Experience</h2>
                    <div className="space-y-4">
                      {content.workHistory.map((w, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-baseline font-serif">
                            <span className="text-xs font-bold text-zinc-950">{w.position}</span>
                            <span className="text-xs text-zinc-600">{w.startDate} — {w.endDate}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500 italic">
                            <span>{w.company}</span>
                            {w.location && <span>{w.location}</span>}
                          </div>
                          {w.description && (
                            <p className="text-[11px] leading-relaxed text-zinc-700 whitespace-pre-wrap">{w.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {content.education && content.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-300 pb-0.5">Education</h2>
                    <div className="space-y-3">
                      {content.education.map((e, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-zinc-950">{e.school}</span>
                            <span className="text-xs text-zinc-600">{e.startDate} — {e.endDate}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-600">
                            <span>{e.degree} {e.field ? `in ${e.field}` : ""}</span>
                            {e.gpa && <span>GPA: {e.gpa}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skillsText && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-300 pb-0.5">Skills</h2>
                    <p className="text-xs leading-relaxed text-zinc-700 italic">
                      {skillsText.split(",").map(s => s.trim()).filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Template 3: MINIMAL */}
            {template === "minimal" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{title || "Professional Resume"}</h1>
                  <div className="flex flex-wrap gap-3 text-[10px] text-zinc-500">
                    {content.contact?.email && <span>{content.contact.email}</span>}
                    {content.contact?.phone && <span>{content.contact.phone}</span>}
                    {content.contact?.link && <span>{content.contact.link}</span>}
                    {content.contact?.location && <span>{content.contact.location}</span>}
                  </div>
                </div>

                {/* Summary */}
                {content.summary && (
                  <p className="text-[11px] leading-relaxed text-zinc-600 whitespace-pre-wrap">{content.summary}</p>
                )}

                {/* Experience */}
                {content.workHistory && content.workHistory.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Experience</div>
                    <div className="space-y-3.5">
                      {content.workHistory.map((w, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold text-zinc-900">{w.position}</span>
                            <span className="text-[10px] text-zinc-400">{w.startDate} — {w.endDate}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">{w.company} {w.location ? `· ${w.location}` : ""}</div>
                          {w.description && (
                            <p className="text-[11px] leading-relaxed text-zinc-600 mt-1 whitespace-pre-wrap">{w.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {content.education && content.education.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Education</div>
                    <div className="space-y-2">
                      {content.education.map((e, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold text-zinc-900">{e.school}</span>
                            <span className="text-[10px] text-zinc-400">{e.startDate} — {e.endDate}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">{e.degree} {e.field ? `in ${e.field}` : ""} {e.gpa ? `(GPA: ${e.gpa})` : ""}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skillsText && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Skills</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                      {skillsText.split(",").map((s, idx) => (
                        <span key={idx}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template 4: EDITORIAL */}
            {template === "editorial" && (
              <div className="grid grid-cols-[180px_1fr] gap-8 h-full">
                {/* Left Sidebar column */}
                <div className="space-y-6 border-r border-zinc-200 pr-6">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-950 uppercase leading-none">{title || "Resume"}</h1>
                    <div className="mt-4 space-y-2.5 text-[10px] text-zinc-600 leading-snug">
                      {content.contact?.email && <div className="break-all"><strong>Email:</strong><br />{content.contact.email}</div>}
                      {content.contact?.phone && <div><strong>Phone:</strong><br />{content.contact.phone}</div>}
                      {content.contact?.link && <div className="break-all"><strong>Web:</strong><br />{content.contact.link}</div>}
                      {content.contact?.location && <div><strong>Loc:</strong><br />{content.contact.location}</div>}
                    </div>
                  </div>

                  {skillsText && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Skills</h3>
                      <div className="flex flex-col gap-1 text-[10px] text-zinc-700">
                        {skillsText.split(",").map((s, idx) => (
                          <span key={idx}>{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Body column */}
                <div className="space-y-6">
                  {/* Summary */}
                  {content.summary && (
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Profile</h3>
                      <p className="text-[11px] leading-relaxed text-zinc-700 whitespace-pre-wrap">{content.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {content.workHistory && content.workHistory.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-150 pb-0.5">Experience</h3>
                      <div className="space-y-4">
                        {content.workHistory.map((w, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-semibold text-zinc-900">{w.position}</span>
                              <span className="text-[10px] text-zinc-500">{w.startDate} — {w.endDate}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-medium">{w.company} {w.location ? `· ${w.location}` : ""}</div>
                            {w.description && (
                              <p className="text-[11px] leading-relaxed text-zinc-600 mt-1 whitespace-pre-wrap">{w.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {content.education && content.education.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-150 pb-0.5">Education</h3>
                      <div className="space-y-3">
                        {content.education.map((e, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-semibold text-zinc-900">{e.school}</span>
                              <span className="text-[10px] text-zinc-500">{e.startDate} — {e.endDate}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500">{e.degree} {e.field ? `in ${e.field}` : ""} {e.gpa ? `(GPA: ${e.gpa})` : ""}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
