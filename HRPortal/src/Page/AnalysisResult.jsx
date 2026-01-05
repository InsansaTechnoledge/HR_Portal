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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../Components/ui/tabs";

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
  FileText,
} from "lucide-react";

import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import {format} from 'date-fns';

export default function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [copied, setCopied] = useState(false);
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);


  const result = location.state?.result || {};
  const analysisType = location.state?.analysisType || "unknown";

  const handleDownload = () => {
    try {
      const json = safeStringify(result);

      console.log(typeof(result));

      const blob = new Blob([json], {
        type: "application/json;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-analysis-${Date.now()}.json`;

      // REQUIRED for Chrome / Edge
      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
};

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

  // const renderContent = () => {
  //   if (!result || Object.keys(result).length === 0) {
  //     return <p className="text-gray-500">No analysis data available.</p>;
  //   }

    // Structured Resume Analyzer response (ATS + rewritten resume + optional job fit)
  //   if (result.ats || result.resume_markdown || result.job_fit) {
  //     const ats = result.ats || {};
  //     const score = ats.score || "N/A";
  //     const topIssues = ats.top_issues || [];
  //     const topImprovements = ats.top_improvements || [];

  //     return (
  //         <div className="space-y-8">
  //         {/* ATS Overview */}
  //           <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
  //             <div className="flex items-center justify-between mb-6">
  //               <div className="flex items-center gap-2">
  //                 <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
  //                   📊
  //                 </div>
  //                 <div>
  //                   <h3 className="text-xl font-semibold text-gray-900">ATS Overview</h3>
  //                   <p className="text-sm text-gray-500">
  //                     High-level insight into how your resume scores in an ATS.
  //                   </p>
  //                 </div>
  //               </div>
  //               <div className="hidden sm:flex flex-col items-end">
  //                 <span className="text-xs uppercase tracking-wide text-gray-400">
  //                   Overall Score
  //                 </span>
  //                 <span className="text-3xl font-bold text-blue-600">{score}</span>
  //               </div>
  //             </div>

  //             <div className="grid gap-6 md:grid-cols-3">
  //               <div className="md:col-span-1 flex sm:hidden flex-col items-start justify-center mb-2">
  //                 <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
  //                   Overall Score
  //                 </p>
  //                 <p className="text-3xl font-bold text-blue-600">{score}</p>
  //               </div>

  //               <div className="md:col-span-1">
  //                 <p className="text-sm font-semibold text-gray-800 mb-2">
  //                   Top Issues
  //                 </p>
  //                 {topIssues.length ? (
  //                   <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 leading-relaxed">
  //                     {topIssues.map((item, idx) => (
  //                       <li key={idx}>{item}</li>
  //                     ))}
  //                   </ul>
  //                 ) : (
  //                   <p className="text-sm text-gray-500">No major issues detected.</p>
  //                 )}
  //               </div>

  //               <div className="md:col-span-1">
  //                 <p className="text-sm font-semibold text-gray-800 mb-2">
  //                   Recommended Improvements
  //                 </p>
  //                 {topImprovements.length ? (
  //                   <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 leading-relaxed">
  //                     {topImprovements.map((item, idx) => (
  //                       <li key={idx}>{item}</li>
  //                     ))}
  //                   </ul>
  //                 ) : (
  //                   <p className="text-sm text-gray-500">No recommendations available.</p>
  //                 )}
  //               </div>
  //             </div>
  //           </section>

  //         {/* Rewritten / Improved Resume */}
  //         {result.resume_markdown && (
  //           <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
  //             <div className="flex items-center gap-2 mb-4">
  //               <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
  //                 📄
  //               </div>
  //               <div>
  //                 <h3 className="text-xl font-semibold text-gray-900">
  //                   Improved Resume Draft
  //                 </h3>
  //                 <p className="text-sm text-gray-500">
  //                   Refined version of your resume based on the analysis.
  //                 </p>
  //               </div>
  //             </div>
  //             <p className="text-sm text-gray-600 mb-4">
  //               Review this draft carefully and adapt it to your own style
  //               and preferred resume template before applying.
  //             </p>
  //             <div className="border border-gray-200 rounded-xl bg-gray-50 max-h-[480px] overflow-y-auto p-4 text-sm whitespace-pre-wrap text-gray-800 leading-relaxed">
  //               {result.resume_markdown}
  //             </div>
  //           </section>
  //         )}

  //         {/* Job Fit Insights (if provided by full crew) */}
  //         {result.job_fit && (
  //           <section className="bg-gradient-to-r from-indigo-50 to-sky-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
  //             <div className="flex items-center gap-2 mb-3">
  //               <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
  //                 🎯
  //               </div>
  //               <div>
  //                 <h3 className="text-xl font-semibold text-indigo-900">
  //                   Job Fit Summary
  //                 </h3>
  //                 <p className="text-sm text-indigo-600">
  //                   How well your profile aligns with the target role.
  //                 </p>
  //               </div>
  //             </div>
  //             <div className="text-sm whitespace-pre-wrap text-indigo-900 leading-relaxed">
  //               {result.job_fit}
  //             </div>
  //           </section>
  //         )}
  //       </div>
  //     );
  //   }

  //   // Handle different response structures from other analyzers
  //   if (result.combined_output) {
  //     return (
  //       <div className="bg-gray-50 p-6 rounded-lg">
  //         <h3 className="text-lg font-semibold mb-4">Analysis Report</h3>
  //         <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
  //           {result.combined_output}
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (result.tasks) {
  //     if (Array.isArray(result.tasks)) {
  //       return (
  //         <div className="space-y-6">
  //           {result.tasks.map((task, idx) => (
  //             <div key={idx} className="bg-gray-50 p-6 rounded-lg">
  //               <h3 className="text-lg font-semibold mb-3">{task.task}</h3>
  //               <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
  //                 {task.output}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       );
  //     } else if (typeof result.tasks === "object") {
  //       return (
  //         <div className="space-y-6">
  //           {Object.entries(result.tasks).map(([taskName, output], idx) => (
  //             <div key={idx} className="bg-gray-50 p-6 rounded-lg">
  //               <h3 className="text-lg font-semibold mb-3 capitalize">
  //                 {taskName.replace(/_/g, " ")}
  //               </h3>
  //               <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
  //                 {output}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       );
  //     }
  //   }

  //   if (result.error) {
  //     return (
  //       <div className="bg-red-50 p-6 rounded-lg border border-red-200">
  //         <p className="text-red-700 font-semibold">Error</p>
  //         <p className="text-red-600">{result.error}</p>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="bg-gray-50 p-6 rounded-lg">
  //       <pre className="text-sm overflow-auto">
  //         {JSON.stringify(result, null, 2)}
  //       </pre>
  //     </div>
  //   );
  // };

  // return (
  //   <div className="min-h-screen bg-gray-100 py-8 px-4">
  //     <div className="max-w-4xl mx-auto">
  //       {/* Header */}
  //       <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
  //         <div className="flex items-center justify-between mb-4">
  //           <div>
  //             <h1 className="text-3xl font-bold text-gray-800">
  //               Resume Analysis Results
  //             </h1>
  //             <p className="text-gray-600 mt-2">
  //               Analysis Type:{" "}
  //               <span className="font-semibold capitalize">{analysisType}</span>
  //             </p>
  //           </div>
  //           <div className="text-right">
  //             <p className="text-sm text-gray-500">
  //               Generated on {new Date().toLocaleDateString()} at{" "}
  //               {new Date().toLocaleTimeString()}
  //             </p>
  //           </div>
  //         </div>

  //         {/* Action Buttons */}
  //         <div className="flex gap-3 flex-wrap">
  //           <button
  //             onClick={handleDownload}
  //             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
  //           >
  //             📥 Download Report
  //           </button>
  //           <button
  //             onClick={handleNewAnalysis}
  //             className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
  //           >
  //             ➕ New Analysis
  //           </button>
  //         </div>
  //       </div>

  //       {/* Tabs */}
  //       <div className="bg-white shadow rounded-lg mb-6">
  //         <div className="flex border-b">
  //           <button
  //             onClick={() => setActiveTab("overview")}
  //             className={`flex-1 py-4 px-6 text-center font-semibold transition ${
  //               activeTab === "overview"
  //                 ? "border-b-2 border-blue-600 text-blue-600"
  //                 : "text-gray-600 hover:text-gray-800"
  //             }`}
  //           >
  //             📊 Analysis
  //           </button>
  //         </div>

  //         {/* Content */}
  //         <div className="p-6">
  //           {activeTab === "overview" && renderContent()}
  //           {activeTab === "details" && (
  //             <div className="bg-gray-50 p-6 rounded-lg">
  //               <h3 className="text-lg font-semibold mb-4">Raw JSON Response</h3>
  //               <pre className="text-sm overflow-auto bg-gray-900 text-gray-100 p-4 rounded">
  //                 {JSON.stringify(result, null, 2)}
  //               </pre>
  //             </div>
  //           )}
  //         </div>
  //       </div>

  //       {/* Footer */}
  //       <div className="text-center text-gray-600 text-sm">
  //         <p>
  //           Keep this report for your records. You can download it for future
  //           reference.
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // );

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
              {result.job_fit}
            </p>
          </div>
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

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="overview" className="gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderContent()}
          </TabsContent>

          <TabsContent value="raw">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Raw JSON Response
                </CardTitle>
                <CardDescription>Complete analysis data in JSON format</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <pre className="text-sm text-emerald-400 bg-slate-900 p-4 rounded-xl overflow-auto font-mono">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
