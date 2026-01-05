import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SuccessToaster from "../Components/Toaster/SuccessToaser";
import ErrorToaster from "../Components/Toaster/ErrorToaster";
import {apibaseURl} from "../config"
import axios from "axios";
import { FileText, Zap, Target, Sparkles, Upload, Briefcase, BarChart3, ArrowRight, ChevronDown, FileUp, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Button } from "../Components/ui/button";
import { Textarea } from "../Components/ui/textarea";
import {Label} from '../Components/ui/label';
import { cn } from "../lib/utils";


export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resume_file, setResumeFile] = useState(null);
  const [job_role, setJobRole] = useState("");
  const [crew, setCrew] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const analysisTypes = [
    { 
      value: "minimal", 
      label: "Minimal Analysis", 
      description: "Resume rewrite + ATS optimization",
      icon: Zap,
      color: "text-amber-500"
    },
    { 
      value: "full", 
      label: "Full Analysis", 
      description: "Complete rewrite + job matching",
      icon: Target,
      color: "text-emerald-500"
    },
    { 
      value: "ats", 
      label: "ATS Only", 
      description: "ATS compatibility check only",
      icon: BarChart3,
      color: "text-blue-500"
    },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];

    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx"))
    ) {
      setResumeFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
      });
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setSuccessMessage("");
      setErrorMessage("");
      setIsLoading(true);

      if (!resume_file || !job_role || !crew) {
        setErrorMessage("Please fill all the details before submitting.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("resume_file", resume_file);
      formData.append("job_role", job_role);
      formData.append("crew", crew);

      console.log("Form Ready for API:", {
        resume_file,
        job_role,
        crew,
      });

      // API call
      const response = await axios.post(`${apibaseURl}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          withCredentials: true,
        },
      });

      if (response.data.success || response.status === 200) {
        setSuccessMessage("Resume analyzed successfully!");
        console.log("Analysis Result:", response.data);
        
        // Navigate to results page after a short delay
        setTimeout(() => {
          navigate("/analysis-result", {
            state: {
              result: response.data,
              analysisType: crew,
            },
          });
        }, 1500);
      }
    } catch (error) {
      console.log("Error during resume analysis:", error);
      setErrorMessage("Failed to analyze resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAnalysis = analysisTypes.find((t) => t.value === crew);

  return (
    // <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    //   <div className="bg-white shadow-xl rounded-xl w-full max-w-2xl p-6">
    //     <h1 className="text-2xl font-bold mb-6 text-center">Resume Analyzer</h1>

    //     {successMessage && <SuccessToaster message={successMessage} />}
    //     {errorMessage && <ErrorToaster message={errorMessage} />}

    //     <form onSubmit={handleSubmit} className="space-y-5">
    //       {/* File Upload */}
    //       <div>
    //         <label className="block font-medium mb-1">Upload Resume</label>
    //         <input
    //           type="file"
    //           accept=".pdf,.doc,.docx"
    //           onChange={(e) => setResumeFile(e.target.files[0])}
    //           className="w-full border rounded-lg p-2"
    //         />
    //       </div>

    //       {/* Text Area */}
    //       <div>
    //         <label className="block font-medium mb-1">
    //           Job Description / Skills
    //         </label>
    //         <textarea
    //           rows="5"
    //           value={job_role}
    //           onChange={(e) => setJobRole(e.target.value)}
    //           placeholder="Paste job Title here..."
    //           className="w-full border rounded-lg p-3"
    //         ></textarea>
    //       </div>

    //       {/* Dropdown */}
    //       <div>
    //         <label className="block font-medium mb-1">Analysis Type</label>
    //         <select
    //           value={crew}
    //           onChange={(e) => setCrew(e.target.value)}
    //           className="w-full border rounded-lg p-2"
    //         >
    //           <option value="">Select</option>
    //           <option value="minimal">Minimal (rewrite + ATS)</option>
    //           <option value="full">Full (rewrite + job match)</option>
    //           <option value="ats">ATS Only</option>
    //         </select>
    //       </div>

    //       {/* Submit */}
    //       <button
    //         type="submit"
    //         disabled={isLoading}
    //         className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
    //       >
    //         {isLoading ? "Analyzing..." : "Analyze Resume"}
    //       </button>
    //     </form>
    //   </div>
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground mb-4 shadow-lg shadow-primary/25">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Resume Analyzer
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your resume and get AI-powered insights to improve your chances of landing your dream job.
          </p>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Zap, title: "ATS Optimized", desc: "Beat applicant tracking systems" },
            { icon: Target, title: "Job Matching", desc: "Tailored to your target role" },
            { icon: Sparkles, title: "AI-Powered", desc: "Smart recommendations" },
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Form Card */}
        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload & Analyze
            </CardTitle>
            <CardDescription>
              Submit your resume for a comprehensive AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Zone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Resume File</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isDragOver 
                      ? "border-primary bg-primary/10 scale-[1.02]" 
                      : "border-border",
                    resume_file && "border-primary/30 bg-primary/5"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {resume_file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{resume_file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(resume_file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <Upload className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground mb-1">
                        Drop your resume here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, DOC, DOCX • Max 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="jobRole" className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Target Job Role / Description
                </Label>
                <Textarea
                  id="jobRole"
                  value={job_role}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="Paste the job title or description you're targeting..."
                  rows={4}
                  className="resize-none bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Provide the job title or paste the full job description for better analysis
                </p>
              </div>

              {/* Analysis Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  Analysis Type
                </Label>
                <div className="relative">
                  <Select value={crew} onValueChange={setCrew}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      {analysisTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={cn("w-4 h-4", type.color)} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"/>
                </div>
                

                {/* Analysis Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {analysisTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setCrew(type.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "hover:border-primary/50 hover:bg-primary/5",
                        crew === type.value 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-background/50"
                      )}
                    >
                      <type.icon className={cn("w-5 h-5 mb-2", type.color)} />
                      <p className="font-medium text-foreground text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Analysis Preview */}
              {selectedAnalysis && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <selectedAnalysis.icon className={cn("w-4 h-4", selectedAnalysis.color)} />
                    <span className="font-medium text-foreground text-sm">
                      {selectedAnalysis.label} Selected
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedAnalysis.description}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !resume_file || !job_role || !crew}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    Analyze Resume
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your resume is processed securely and not stored after analysis
        </p>
      </div>
    </div>
  );
}
