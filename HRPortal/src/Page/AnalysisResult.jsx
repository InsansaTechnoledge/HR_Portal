import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const result = location.state?.result || {};
  const analysisType = location.state?.analysisType || "unknown";

  const handleDownload = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-analysis-${Date.now()}.json`;
    link.click();
  };

  const handleNewAnalysis = () => {
    navigate("/resume-analyze");
  };

  const renderContent = () => {
    if (!result || Object.keys(result).length === 0) {
      return <p className="text-gray-500">No analysis data available.</p>;
    }

    // Structured Resume Analyzer response (ATS + rewritten resume + optional job fit)
    if (result.ats || result.resume_markdown || result.job_fit) {
      const ats = result.ats || {};
      const score = ats.score || "N/A";
      const topIssues = ats.top_issues || [];
      const topImprovements = ats.top_improvements || [];

      return (
          <div className="space-y-8">
          {/* ATS Overview */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                    📊
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">ATS Overview</h3>
                    <p className="text-sm text-gray-500">
                      High-level insight into how your resume scores in an ATS.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    Overall Score
                  </span>
                  <span className="text-3xl font-bold text-blue-600">{score}</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 flex sm:hidden flex-col items-start justify-center mb-2">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Overall Score
                  </p>
                  <p className="text-3xl font-bold text-blue-600">{score}</p>
                </div>

                <div className="md:col-span-1">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Top Issues
                  </p>
                  {topIssues.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 leading-relaxed">
                      {topIssues.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No major issues detected.</p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Recommended Improvements
                  </p>
                  {topImprovements.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 leading-relaxed">
                      {topImprovements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No recommendations available.</p>
                  )}
                </div>
              </div>
            </section>

          {/* Rewritten / Improved Resume */}
          {result.resume_markdown && (
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                  📄
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Improved Resume Draft
                  </h3>
                  <p className="text-sm text-gray-500">
                    Refined version of your resume based on the analysis.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Review this draft carefully and adapt it to your own style
                and preferred resume template before applying.
              </p>
              <div className="border border-gray-200 rounded-xl bg-gray-50 max-h-[480px] overflow-y-auto p-4 text-sm whitespace-pre-wrap text-gray-800 leading-relaxed">
                {result.resume_markdown}
              </div>
            </section>
          )}

          {/* Job Fit Insights (if provided by full crew) */}
          {result.job_fit && (
            <section className="bg-gradient-to-r from-indigo-50 to-sky-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-900">
                    Job Fit Summary
                  </h3>
                  <p className="text-sm text-indigo-600">
                    How well your profile aligns with the target role.
                  </p>
                </div>
              </div>
              <div className="text-sm whitespace-pre-wrap text-indigo-900 leading-relaxed">
                {result.job_fit}
              </div>
            </section>
          )}
        </div>
      );
    }

    // Handle different response structures from other analyzers
    if (result.combined_output) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Analysis Report</h3>
          <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
            {result.combined_output}
          </div>
        </div>
      );
    }

    if (result.tasks) {
      if (Array.isArray(result.tasks)) {
        return (
          <div className="space-y-6">
            {result.tasks.map((task, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">{task.task}</h3>
                <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                  {task.output}
                </div>
              </div>
            ))}
          </div>
        );
      } else if (typeof result.tasks === "object") {
        return (
          <div className="space-y-6">
            {Object.entries(result.tasks).map(([taskName, output], idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 capitalize">
                  {taskName.replace(/_/g, " ")}
                </h3>
                <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                  {output}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }

    if (result.error) {
      return (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600">{result.error}</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Resume Analysis Results
              </h1>
              <p className="text-gray-600 mt-2">
                Analysis Type:{" "}
                <span className="font-semibold capitalize">{analysisType}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              📥 Download Report
            </button>
            <button
              onClick={handleNewAnalysis}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ New Analysis
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📊 Analysis
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "overview" && renderContent()}
            {activeTab === "details" && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Raw JSON Response</h3>
                <pre className="text-sm overflow-auto bg-gray-900 text-gray-100 p-4 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>
            Keep this report for your records. You can download it for future
            reference.
          </p>
        </div>
      </div>
    </div>
  );
}
