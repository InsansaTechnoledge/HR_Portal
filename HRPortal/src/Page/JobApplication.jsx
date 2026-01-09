import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import API_BASE_URL from "../config";
import {
  Eye,
  FileText,
  Search,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  Linkedin,
  Github,
  User,
  X as XIcon,
  Filter,
  ChevronLeft, 
  ChevronRight,
  Users,
   CheckCircle,
   XCircle,
   Upload,
   Cloud,
  CloudOff,
  MapPin,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "../Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader,TableRow } from '../Components/ui/table';
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle} from "../Components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../Components/ui/dialog";
import { Badge } from "../Components/ui/badge";
import { Label } from "../Components/ui/label";
import { toast } from "../hooks/useToast";

const JobApplication = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [failedRows, setFailedRows] = useState([]);
  const [error, setError] = useState(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeTarget, setResumeTarget] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [driveConnected, setDriveConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/candidate-application`
      );
      const apps = Array.isArray(response.data?.applications)
        ? response.data.applications
        : [];
      const normalized = apps.map((a) => ({
        ...a,
        position: a.rawJobTitle || "",
      }));
      setApplications(normalized);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast ({
        variant: "destructive",
        title: "Fetch Error",
        description: err.response?.data?.message || "Failed to fetch applications.",
      });
      setApplications([]);
    }
  };

  const openResumeModal = (application) => {
    setResumeTarget(application);
    setResumeFile(null);
    setResumeModalOpen(true);
  };

  const closeResumeModal = () => {
    setResumeModalOpen(false);
    setResumeTarget(null);
    setResumeFile(null);
  };

  const handleResumeUpload = async () => {
    try {
      if (!resumeTarget?._id) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: "Invalid application selected for resume upload.",
        });
        return;
      }
      if (!resumeFile) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: "Please select a resume file to upload.",
        });
        return;
      }

      setResumeUploading(true);
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const resp = await axios.post(
        `${API_BASE_URL}/api/candidate-application/${resumeTarget._id}/resume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      
      const newUrl = resp.data?.resumeUrl;
      if (newUrl) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === resumeTarget._id ? { ...app, resume: newUrl } : app
          )
        );
      }
      if (resp.status === 200) {
        toast({
          title: "Resume Uploaded",
          description: resp.data?.message || "Resume uploaded successfully.",
        });
      }
      closeResumeModal();
      
    } catch (err) {
      console.error("Resume upload failed", err);
      toast.error(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const statusStyles = {
    "Under Review": {
      color: "text-yellow-600",
      icon: <Clock className="inline mr-2" />,
      label: "Under Review",
    },
    Selected: {
      color: "text-green-600",
      icon: <Check className="inline mr-2" />,
      label: "Selected",
    },
    Rejected: {
      color: "text-red-600",
      icon: <X className="inline mr-2" />,
      label: "Rejected",
    },
  };

  const connectGoogleDrive = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/google-drive/connect`,
        {
          withCredentials: true,
        }
      );

      // Redirect user to Google's OAuth consent page
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Error connecting Google Drive:", err);
      toast ({
        variant: "destructive",
        title: "Connection Error",
        description:
          err.response?.data?.message ||
          "Failed to connect to Google Drive. Please try again.",
      });
    }
  };

  const disconnectGoogleDrive = async () => {
    console.log("Disconnect function called, current state:", driveConnected);
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/google-drive/disconnect`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      console.log("Disconnect response:", response.data);

      // Small delay to ensure DB is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify disconnection by checking status
      const statusResp = await axios.get(
        `${API_BASE_URL}/api/google-drive/status`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      console.log("Status after disconnect:", statusResp.data);
      const newStatus = Boolean(statusResp.data?.connected);
      console.log("Setting driveConnected to:", newStatus);
      setDriveConnected(newStatus);
      toast({
        title: "Disconnected",
        description: response.data?.message || "Google Drive disconnected successfully.",
      });
      setLoading(false);
    } catch (err) {
      console.error("Disconnect error:", err);
      setLoading(false);
      toast ({
        variant: "destructive",
        title: "Disconnection Error",
        description:
          err.response?.data?.message || "Failed to disconnect Google Drive. Please try again.",
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");

    if (connected === "google") {
      setDriveConnected(true);
      toast ({
        title: "Google Drive Connected",
        description: "Google Drive connected successfully.",
      });
      navigate("/application", { replace: true });
    } else if (error) {
      setDriveConnected(false);
      toast ({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect Google Drive.",
      });
      navigate("/application", { replace: true });
    }
  }, [navigate]);

  // Check drive connection status from backend on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const resp = await axios.get(
          `${API_BASE_URL}/api/google-drive/status`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        setDriveConnected(Boolean(resp.data?.connected));
      } catch (err) {
        // Keep existing state if status check fails
      }
    };
    checkStatus();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/candidate-application/${id}/status`,
        { status: newStatus }
      );

      if (response.status === 200) {
        setApplications((apps) =>
          apps.map((app) =>
            app._id === id ? { ...app, status: newStatus } : app
          )
        );
        toast ({
          // variant: "success",
          title: "Status Updated",
          description: `Application status updated to ${newStatus}` || response.data?.message,
        });
        console.log("Status updated successfully:", response.data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast ({
        variant: "destructive",
        title: "Update Error",
        description:
          error.response?.data?.message || "Failed to update application status. Please try again.",
      });
    }
  };

  const handleViewResume = (app) => {
    const resumeUrl = app?.resume;
    const hasResume = resumeUrl && resumeUrl !== "BULK_UPLOAD_PENDING";

    if (hasResume) {
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Resume not uploaded yet. Upload now?");
      openResumeModal(app);
    }
  };

  useEffect(() => {
    if (applications && applications.length > 0) {
      const filtered = applications.filter(
        (app) =>
          (searchTerm === "" ||
            (app.name &&
              app.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (app.email &&
              app.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (app.position &&
              app.position.toLowerCase().includes(searchTerm.toLowerCase()))) &&
          (statusFilter === "" || statusFilter === "all" || app.status === statusFilter)
      );
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications([]);
    }
  }, [applications, searchTerm, statusFilter]);

  const handleViewProfile = (applicant) => {
    try {
      if (!applicant) {
        toast.error("Applicant data not found");
        return;
      }
      setSelectedApplicant(applicant);
      setShowProfileModal(true);
    } catch (err) {
      console.error("Error loading applicant profile:", err);
      toast.error("Failed to load applicant profile");
    }
  };

 const uploadExcelFiles = async () => {
    try {
      if (!excelFile) {
        toast.error("Please select an Excel file to upload.");
        return;
      }
 
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
 
      if (!allowedTypes.includes(excelFile.type)) {
        toast ({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid Excel file (.xlsx, .xls, .csv).",
        });
        return;
      }
 
      setLoading(true);
 
      const formData = new FormData();
      formData.append("file", excelFile);
 
      const response = await axios.post(
        `${API_BASE_URL}/api/bulk-upload/applications`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
 
      setExcelFile(null);
      document.getElementById("excelFileInput").value = null;
 
      const { inserted, failedCount, failedRows: failed } = response.data;
 
      // Store failed rows for download
      if (failed && failed.length > 0) {
        setFailedRows(failed);
      }
 
      // Show appropriate message based on results
      if (failedCount === 0) {
        toast ({
          variant: "success",
          title: "Upload Successful",
          description: `${inserted} records uploaded successfully.`,
        });
      } else if (inserted > 0 && failedCount > 0) {
        toast ({
          variant: "destructive",
          title: "Partial Upload",
          description: `${inserted} records uploaded successfully, ${failedCount} failed. You can download the failed records for details.`,
        });
      } else {
        toast ({
          variant: "destructive",
          title: "Upload Failed",
          description: `All records failed to upload. You can download the failed records for details.`,
        });
      }
 
      await fetchApplications();
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to upload Excel file. Please try again.";
      toast ({
        variant: "destructive",
        title: "Upload Error",
        description: errorMsg,
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFailedRows = () => {
    if (!failedRows || failedRows.length === 0) {
      toast ({
        variant: "destructive",
        title: "No Failed Rows",
        description: "There are no failed rows to download.",
      });
      return;
    }

    // Convert failed rows to flat structure with all details and reason
    const excelData = failedRows.map((item) => ({
      "Row #": item.rowNumber,
      "Candidate Name": item.name,
      "Email": item.email,
      "Phone": item.phone,
      "Total Experience": item.experience,
      "Relevant Experience": item.relevantExperience,
      "Skills": item.skills,
      "Location": item.location,
      "Notice Period": item.noticePeriod,
      "LinkedIn": item.linkedIn,
      "Failure Reason": item.reason || "Unknown error",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },    // Row #
      { wch: 20 },   // Candidate Name
      { wch: 25 },   // Email
      { wch: 15 },   // Phone
      { wch: 18 },   // Total Experience
      { wch: 20 },   // Relevant Experience
      { wch: 25 },   // Skills
      { wch: 15 },   // Location
      { wch: 20 },   // Notice Period
      { wch: 20 },   // LinkedIn
      { wch: 40 },   // Failure Reason
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FailedRows");

    // Download file
    XLSX.writeFile(workbook, "failed_job_applications.xlsx");
    toast.success("Failed rows downloaded successfully!");
    setFailedRows([]); 
  };

  // const handleDownloadTemplate = () => {
  //   // Define Excel headers
  //   const worksheetData = [
  //     {
  //       name: "",
  //       email: "",
  //       phone: "",
  //       jobTitle: "",
  //     },
  //   ];

  //   // Create worksheet
  //   const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  //   // Create workbook
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "JobApplications");

  //   // Download file
  //   XLSX.writeFile(workbook, "job_applications_bulk_upload_template.xlsx");
  // };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedApplicant(null);
  };

  const uploadBulkResumes = async () => {
    if (!zipFile) return toast.error("Please select a ZIP file");
 
    try {
      toast ({
        title: "Uploading Resumes",
        description: "Please wait while the resumes are being uploaded...",
      });
 
      const formData = new FormData();
      formData.append("zip", zipFile);
 
      const response = await axios.post(
        `${API_BASE_URL}/api/bulk-upload/resumes`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
 
      const { successCount, failed } = response.data;
 
      // Show success message
      toast ({
        variant: "success",
        title: "Upload Complete",
        description: `${successCount} resumes uploaded successfully.`,
      });
 
      // Show failed uploads if any
      if (failed && failed.length > 0) {
        const phoneNotMatched = failed.filter(
          (f) => f.reason === "No matching application"
        );
        const otherFailed = failed.filter(
          (f) => f.reason !== "No matching application"
        );
 
        if (phoneNotMatched.length > 0) {
          const fileList = phoneNotMatched.map((f) => f.file).join(", ");
          toast ({
            variant: "destructive",
            title: `${phoneNotMatched.length} file${phoneNotMatched.length !== 1 ? "s" : ""} failed`,
            description: `Phone number not found in database. Files: ${fileList}`,
          });
        }
 
        if (otherFailed.length > 0) {
          const failureReasons = otherFailed
            .map((f) => `${f.file} (${f.reason})`)
            .join(", ");
          toast.error(
            `${otherFailed.length} file${
              otherFailed.length !== 1 ? "s" : ""
            } failed: ${failureReasons}`,
            { duration: 8000 }
          );
        }
      }
 
      // Reset zip file
      setZipFile(null);
      document.getElementById("BulkResume").value = null;
      // Refresh applications
      fetchApplications();
    } catch (err) {
      console.error("Resume upload error:", err);
      toast ({
        variant: "destructive",
        title: "Upload Error",
        description:
          err.response?.data?.message ||  "Failed to upload resumes. Please try again.",
      });
 
      // Check if error is due to Google Drive not connected
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("Google Drive")
      ) {
        toast ({
          variant: "destructive",
          title: "Google Drive Not Connected",
        });
        return;
      }
 
      toast ({
        variant: "destructive",
        title: "Upload Error",
        description:
          err.response?.data?.message ||  "Failed to upload resumes. Please try again.",
      });
    }
  };
 

  // Ensure external profile URLs open correctly by adding https:// when missing
  const normalizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (trimmed.length === 0) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const stats = {
    total: applications.length,
    underReview: applications.filter(a => a.status === 'Under Review').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };
  return (
     <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="min-h-screen bg-background p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Job Applications
                </h1>
                <p className="text-muted-foreground">
                  Manage and track all job applicants
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Applications", value: stats.total, color: "text-primary", icon: Users },
                { label: "Under Review", value: stats.underReview, color: "text-info", icon: Clock },
                { label: "Selected", value: stats.selected, color: "text-success", icon: CheckCircle },
                { label: "Rejected", value: stats.rejected, color: "text-destructive", icon: XCircle },
              ].map((stat, i) => (
                <Card key={i} className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Tools & Uploads */}
            <Card className="border-0 shadow-card">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Tools & Uploads
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Upload Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Bulk Excel Upload */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Bulk Application Upload</h3>
                        <p className="text-xs text-muted-foreground">
                          Upload Excel file (.xlsx, .xls, .csv)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          id="excelFileInput"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => setExcelFile(e.target.files[0] || null)}
                          className="hidden"
                        />
                        <div className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground font-medium hover:border-primary transition text-center text-sm truncate">
                          {excelFile ? excelFile.name : "Choose Excel File"}
                        </div>
                      </label>

                      <Button
                        size="sm"
                        disabled={loading || !excelFile}
                        onClick={ uploadExcelFiles}
                        className="gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  {/* Bulk Resume ZIP Upload */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20 hover:border-info/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Bulk Resume Upload</h3>
                        <p className="text-xs text-muted-foreground">
                          Upload ZIP file with resumes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          id="BulkResume"
                          accept=".zip"
                          onChange={(e) => setZipFile(e.target.files[0] || null)}
                          className="hidden"
                        />
                        <div className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground font-medium hover:border-info transition text-center text-sm truncate">
                          {zipFile ? zipFile.name : "Choose ZIP File"}
                        </div>
                      </label>

                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={loading || !zipFile}
                        onClick={uploadBulkResumes}
                        className="gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Google Drive Toggle */}
                <button
                  onClick={driveConnected ? disconnectGoogleDrive : connectGoogleDrive}
                  className={`w-full md:w-auto flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
                    driveConnected
                      ? "bg-success/10 border-success/30 hover:border-success/50"
                      : "bg-destructive/10 border-destructive/30 hover:border-destructive/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        driveConnected ? "bg-success/20" : "bg-destructive/20"
                      }`}
                    >
                      {driveConnected ? (
                        <Cloud className="w-5 h-5 text-success" />
                      ) : (
                        <CloudOff className="w-5 h-5 text-destructive" />
                      )}
                    </div>

                    <div className="text-left">
                      <div
                        className={`text-sm font-semibold ${
                          driveConnected ? "text-success" : "text-destructive"
                        }`}
                      >
                        Google Drive
                      </div>
                      <div
                        className={`text-xs ${
                          driveConnected ? "text-success/70" : "text-destructive/70"
                        }`}
                      >
                        {driveConnected ? "Connected" : "Disconnected"}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      driveConnected ? "bg-success" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        driveConnected ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
                {failedRows.length > 0 && (
                  <div className="mt-4 p-4 bg-red-600/20 border border-red-500/50 rounded-xl">
                    <div className="mb-3">
                      <p className="text-red-300 font-semibold mb-2">⚠️ Failed Records ({failedRows.length})</p>
                      <p className="text-red-200/70 text-sm mb-3">Download the file to see which rows failed and the reasons why.</p>
                    </div>
                    <button
                      onClick={handleDownloadFailedRows}
                      className="w-full px-4 py-3 bg-red-600 text-white border border-red-400 rounded-lg hover:bg-red-700 hover:border-red-300 transition font-medium"
                    >
                      📥 Download Failed Rows ({failedRows.length})
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or position..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        {/* <Filter className="w-4 h-4 mr-2" /> */}
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Selected">Selected</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            {/* Applications Table */}
            <Card className="border-0 shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-lg">
                  Applications ({filteredApplications.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead>Applicant</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="hidden lg:table-cell">Skills</TableHead>
                        <TableHead className="hidden lg:table-cell">Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginatedApplications.map((app) => (
                        <TableRow key={app._id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-bold">
                                {app.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{app.name}</p>
                                <p className="text-xs text-muted-foreground">{app.position}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> {app.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {app.phone.join(", ")}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(Array.isArray(app.skills) ? app.skills.slice(0, 2) : [app.skills]).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {Array.isArray(app.skills) && app.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{app.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {app.experience || "-"}
                          </TableCell>

                          <TableCell>
                          <div className="relative">
                              <Select
                                value={app.status}
                                onValueChange={(val) => handleStatusChange(app._id, val)}
                              >
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Under Review">Under Review</SelectItem>
                                  <SelectItem value="Selected">Selected</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                            
                          </TableCell>

                          <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                              <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-1"
                                    onClick={() => handleViewProfile(app)}
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">View</span>
                                </Button>
                              {app?.resume &&
                                  app.resume !== "BULK_UPLOAD_PENDING" ? (
                                    <Button 
                                      variant="secondary" 
                                      size="sm" 
                                      className="gap-1"
                                      onClick={() => window.open(app.resume, '_blank')}
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span className="hidden sm:inline">Resume</span>
                                    </Button>
                                  ) : (
                                    <Button 
                                      // variant="outline" 
                                      size="sm" 
                                      className="gap-1 bg-amber/20 border-hr-amber/50 text-hr-amber hover:bg-hr-amber/50 hover:text-amber-500"
                                      onClick={() => openResumeModal(app)}
                                    >
                                      <Upload className="w-4 h-4" />
                                      <span className="hidden sm:inline">Upload</span>
                                    </Button>
                                )}
                              </div>
                            {/* <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleViewProfile(app)}
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </div> */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {/* Pagination */}
              {filteredApplications.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/20">

                  {/* Items per page */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Showing</span>

                    <div className="relative">
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(val) => {
                          setItemsPerPage(Number(val));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[80px] h-8">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <span>of {filteredApplications.length}</span>
                  </div>

                  {/* Page controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}


            </Card>
          </div>
          {/* Profile Modal */}
              <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {selectedApplicant?.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedApplicant?.name}</h2>
                        <p className="text-sm text-muted-foreground font-normal">{selectedApplicant?.position}</p>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="h-1 w-6 bg-primary rounded-full" />
                        Contact Information
                      </h3>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{selectedApplicant?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                          <Phone className="w-5 h-5 text-success" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedApplicant?.phone}</p>
                          </div>
                        </div>
                        {selectedApplicant?.location && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-info/5 border border-info/10">
                            <MapPin className="w-5 h-5 text-info" />
                            <div>
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="font-medium">{selectedApplicant.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="h-1 w-6 bg-info rounded-full" />
                        Professional Details
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/30 border border-border">
                          <p className="text-xs text-muted-foreground">Position</p>
                          <p className="font-medium">{selectedApplicant?.rawJobTitle || selectedApplicant?.position}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border border-border">
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="font-medium">{selectedApplicant?.experience || 'Not specified'}</p>
                        </div>
                        {selectedApplicant?.noticePeriod && (
                          <div className="p-3 rounded-lg bg-muted/30 border border-border">
                            <p className="text-xs text-muted-foreground">Notice Period</p>
                            <p className="font-medium">{selectedApplicant.noticePeriod}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {selectedApplicant?.skills && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          <div className="h-1 w-6 bg-hr-amber rounded-full" />
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(selectedApplicant.skills) ? selectedApplicant.skills : [selectedApplicant.skills]).map((skill, idx) => (
                            <Badge key={idx} className="bg-hr-amber/10 text-hr-amber border-hr-amber/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {(selectedApplicant?.linkedIn || selectedApplicant?.github) && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          <div className="h-1 w-6 bg-destructive rounded-full" />
                          Social Profiles
                        </h3>
                        <div className="space-y-2">
                          {selectedApplicant?.linkedIn && (
                            <a
                              href={normalizeUrl(selectedApplicant.linkedIn)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-lg bg-[#0077b5]/10 border border-[#0077b5]/20 hover:border-[#0077b5]/40 transition"
                            >
                              <div className="flex items-center gap-3">
                                <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                <span className="text-sm text-[#0077b5]">LinkedIn Profile</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Open ↗</span>
                            </a>
                          )}
                          {selectedApplicant?.github && (
                            <a
                              href={normalizeUrl(selectedApplicant.github)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:border-muted-foreground/30 transition"
                            >
                              <div className="flex items-center gap-3">
                                <Github className="w-5 h-5" />
                                <span className="text-sm">GitHub Profile</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Open ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setShowProfileModal(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            {/* Resume Upload Modal */}
              <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Upload Resume
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm text-muted-foreground">
                        Candidate: <span className="font-semibold text-foreground">{resumeTarget?.name}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Resume File</Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {resumeFile && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {resumeFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResumeModalOpen(false)} disabled={resumeUploading}>
                      Cancel
                    </Button>
                    <Button onClick={handleResumeUpload} disabled={resumeUploading || !resumeFile}>
                      {resumeUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
        </div>
     </div>
  );
};

export default JobApplication;
