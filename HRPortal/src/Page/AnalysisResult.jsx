import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../Components/ui/card";

import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Separator } from "../Components/ui/separator";
import { ScrollArea } from "../Components/ui/scroll-area";

import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  FileCheck,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Target,
  Plus,
  Download,
  Clock,
  Sparkles,
} from "lucide-react";

import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import {format} from 'date-fns';

export default function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);


  const result = location.state?.result || {};
  const analysisType = location.state?.analysisType || "unknown";


//function for safe stringify (oovercome circular data error)
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return;
        seen.add(value);
      }
      return value;
    },
    2
  );
};

//Format for downloadable file 
const formatResult = (r) => `
RESUME ANALYSIS REPORT
=====================

ATS COMPATIBILITY
-----------------
Score : ${r.ats?.score ?? "N/A"}

--------------------------------------------------

TOP ATS ISSUES
--------------
${(r.ats?.top_issues && r.ats.top_issues.length)
  ? r.ats.top_issues.map((issue, i) => `${i + 1}. ${issue}`).join("\n\n")
  : "No critical ATS issues identified."}

--------------------------------------------------

RECOMMENDED IMPROVEMENTS
------------------------
${(r.ats?.top_improvements && r.ats.top_improvements.length)
  ? r.ats.top_improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n\n")
  : "No specific improvement recommendations available."}

--------------------------------------------------

JOB FIT ANALYSIS
----------------
${r.job_fit || "No job fit analysis available."}

--------------------------------------------------

OPTIMIZED RESUME CONTENT
------------------------
${r.resume_markdown || "Optimized resume content not available."}

--------------------------------------------------

Report Generated On:
${new Date().toLocaleString()}

This report is generated to help improve resume quality
and ATS compatibility. Final hiring decisions are made
by employers and recruiters.
`;


const downloadAsPDF = (analysis) => {
  if (!analysis || typeof analysis !== "object") {
    alert("Invalid analysis data");
    return;
  }

  const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    }
  );
  let text = safeStringify(analysis);

  text = formatResult(result);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const marginX = 15;
  let cursorY = 15;
  const pageHeight = doc.internal.pageSize.height;

  const lines = doc.splitTextToSize(text, 180);

  lines.forEach((line) => {
    if (cursorY > pageHeight - 15) {
      doc.addPage();
      cursorY = 15;
    }
    doc.text(line, marginX, cursorY);
    cursorY += 5;
  });

  doc.save(`resume-analysis-${Date.now()}.pdf`);
};


  const getScoreColor = (score) => {
    const value = parseInt(score);
    if (value >= 80) return "text-emerald-500";
    if (value >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const handleCopyResume = async () => {
    await navigator.clipboard.writeText(result.resume_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreProgress = (score) => {
    const numScore = parseInt(score);
    return Math.min(100, Math.max(0, numScore));
  };

  const analysisTypes = [
  { value: "minimal", label: "Minimal", color: "border-amber-500" },
  { value: "full", label: "Full", color: "border-emerald-500" },
  { value: "ats", label: "ATS", color: "border-blue-500" },
];

const currentType =
  analysisTypes.find((t) => t.value === analysisType) ||
  analysisTypes[0];


  const ats = result.ats || {};

  const score = ats.score || "0/100";
  const topIssues = ats.top_issues || [];
  const topImprovements = ats.top_improvements || [];

  const scoreProgress = parseInt(score); // "78/100" → 78


  const handleNewAnalysis = () => {
    navigate("/resume-analyzer");
  };

  const renderATSSection = () => {
    const ats = result.ats || {};
    const score = ats.score || "N/A";
    const topIssues = ats.top_issues || [];
    const topImprovements = ats.top_improvements || [];
    const scoreProgress = getScoreProgress(score);

    return (
      <div className="space-y-6">
        {/* Score Card */}
        <Card className="border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                  <BarChart3 className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">ATS Compatibility Score</h3>
                  <p className="text-muted-foreground text-sm">
                    How well your resume performs with Applicant Tracking Systems
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={cn("text-4xl font-bold", getScoreColor(score))}>
                    {score}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Score</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    scoreProgress >= 80 ? "bg-emerald-500" : scoreProgress >= 60 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${scoreProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Needs Work</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Issues & Improvements Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Issues Card */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                Top Issues
              </CardTitle>
              <CardDescription>Areas that need improvement</CardDescription>
            </CardHeader>
            <CardContent>
              {topIssues.length > 0 ? (
                <ul className="space-y-3">
                  {topIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-destructive">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{issue}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">No major issues detected</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Improvements Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                </div>
                Recommendations
              </CardTitle>
              <CardDescription>Suggested improvements</CardDescription>
            </CardHeader>
            <CardContent>
              {topImprovements.length > 0 ? (
                <ul className="space-y-3">
                  {topImprovements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{improvement}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific recommendations available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderResumeSection = () => {
    if (!result.resume_markdown) return null;

    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Improved Resume Draft</CardTitle>
                <CardDescription>Optimized version based on our analysis</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyResume}
                className="gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResumeExpanded(!isResumeExpanded)}
              >
                {isResumeExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Review this draft carefully and adapt it to your own style and preferred resume template before applying.
            </p>
            <ScrollArea className={cn(
              "transition-all duration-300",
              isResumeExpanded ? "h-[600px]" : "h-[300px]"
            )}>
              <div className="pr-4">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {result.resume_markdown}
                </pre>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderJobFitSection = () => {
    if (!result.job_fit) return null;

    const jobFit = result.job_fit;
    
    // Handle if job_fit is a string
    if (typeof jobFit === 'string') {
      return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Job Fit Analysis</CardTitle>
                <CardDescription>How well your profile aligns with the target role</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-background/50 border border-primary/10">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {jobFit}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Handle if job_fit is an object with structured data
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Job Fit Analysis</CardTitle>
              <CardDescription>How well your profile aligns with the target role</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Role */}
          {jobFit.job_role && (
            <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Target Role</p>
              <p className="text-sm font-medium text-foreground">{jobFit.job_role}</p>
            </div>
          )}

          {/* Match Score */}
          {jobFit.match_score && (
            <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Match Score</p>
              <p className={cn("text-2xl font-bold", getScoreColor(jobFit.match_score))}>
                {jobFit.match_score}
              </p>
            </div>
          )}

          {/* Verdict */}
          {jobFit.verdict && (
            <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Verdict</p>
              <p className="text-sm text-foreground leading-relaxed">{jobFit.verdict}</p>
            </div>
          )}

          {/* Strengths */}
          {jobFit.strengths && Array.isArray(jobFit.strengths) && jobFit.strengths.length > 0 && (
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-foreground">Strengths</p>
              </div>
              <ul className="space-y-2">
                {jobFit.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {jobFit.gaps && Array.isArray(jobFit.gaps) && jobFit.gaps.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-foreground">Gaps to Address</p>
              </div>
              <ul className="space-y-2">
                {jobFit.gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {jobFit.recommendations && Array.isArray(jobFit.recommendations) && jobFit.recommendations.length > 0 && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Recommendations</p>
              </div>
              <ul className="space-y-2">
                {jobFit.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (!result || Object.keys(result).length === 0) {
      return (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis Data</h3>
              <p className="text-muted-foreground mb-6">
                No analysis results available. Try running a new analysis.
              </p>
              <Button onClick={handleNewAnalysis}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (result.error) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">Analysis Error</h3>
                <p className="text-sm text-muted-foreground">{result.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Structured Resume Analyzer response
    if (result.ats || result.resume_markdown || result.job_fit) {
      return (
        <div className="space-y-6">
          {result.ats && renderATSSection()}
          {renderResumeSection()}
          {renderJobFitSection()}
        </div>
      );
    }

    // Fallback for other response structures
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <pre className="text-sm text-foreground overflow-auto bg-muted p-4 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      Analysis Results
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className={cn("capitalize", currentType.color)}>
                        {currentType.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(), "dd-MM-yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => downloadAsPDF(result)} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button onClick={handleNewAnalysis} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Analysis
                  </Button>
                </div>
              </div>
            </CardHeader>
          </div>
        </Card>

        {/* Analysis Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <Separator className="my-8" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Keep this report for your records. Download it for future reference or start a new analysis.
          </p>
        </div>
      </div>
    </div>
  );
};
