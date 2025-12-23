import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast, Toaster } from "react-hot-toast";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      console.log("Fetching applications...");
      const response = await axios.get(`${API_BASE_URL}/api/job/applications`);
      console.log(response.data.JobApplications);
      setApplications(response.data.JobApplications);
    } catch (err) {
      console.error("Error fetching applications:", err);
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
        toast.error("No application selected");
        return;
      }
      if (!resumeFile) {
        toast.error("Please choose a resume file (PDF/Doc)");
        return;
      }

      setResumeUploading(true);
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const resp = await axios.post(
        `${API_BASE_URL}/api/job-application/${resumeTarget._id}/resume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
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

      toast.success(resp.data?.message || "Resume uploaded successfully");
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Redirect user to Google's OAuth consent page
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Error connecting Google Drive:", err);
      toast.error(
        err.response?.data?.message || "Failed to connect Google Drive"
      );
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");

    if (connected === "google") {
      toast.success("Google Drive connected successfully");
      navigate("/application", { replace: true });
    } else if (error) {
      toast.error("Failed to connect Google Drive");
      navigate("/application", { replace: true });
    }
  }, [navigate]);
  

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Update the API with the new status
      const response = await axios.put(
        `${API_BASE_URL}/api/job/application/status/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        setApplications((apps) =>
          apps.map((app) =>
            app._id === id ? { ...app, status: newStatus } : app
          )
        );
        console.log("Status updated successfully:", response.data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
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
          (statusFilter === "" || app.status === statusFilter)
      );
      setFilteredApplications(filtered);
      console.log("Filtered Applications:", filtered);
    } else {
      setFilteredApplications([]);
    }
  }, [applications, searchTerm, statusFilter]);

  const handleViewProfile = async (applicantId) => {
    try {
      if (!applicantId) {
        alert("Applicant ID not found");
        return;
      }

      setProfileLoading(true);
      console.log("Fetching applicant profile for ID:", applicantId);
      const response = await axios.get(
        `${API_BASE_URL}/api/career-portal/profile/${applicantId}`
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);

      if (response.status === 200 && response.data) {
        const applicantData = response.data.applicant || response.data;
        console.log("Setting applicant data:", applicantData);
        setSelectedApplicant(applicantData);
        setShowProfileModal(true);
        console.log("User Profile Data:", applicantData);
      }
    } catch (err) {
      console.error("Error fetching applicant profile:", err);
      alert("Failed to load applicant profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const uploadExcelFiles = async () => {
    try {
      if (!excelFile) {
        toast.error("Please select an Excel file to upload.");
        return;
      }

      // File type validation
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!allowedTypes.includes(excelFile.type)) {
        toast.error("Only Excel files (.xlsx, .xls) are allowed");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", excelFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/bulk-upload/applications`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const {
          successCount = 0,
          failedCount = 0,
          failedRows = [],
        } = response.data;

        //  Handle full / partial success
        if (failedCount > 0) {
          toast.error("Bulk upload completed with some failures.");
          setError("Some rows failed to upload.");
          setFailedRows(failedRows);
        } else {
          toast.success("Bulk upload successful!");
          setFailedRows([]);
          setError(null);
        }

        // Reset input
        setExcelFile(null);
        document.getElementById("excelFileInput").value = "";

        // Refresh list
        await fetchApplications();
      }
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to upload Excel file. Please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFailedRows = () => {
    if (!failedRows || failedRows.length === 0) {
      alert("No failed rows to download");
      return;
    }

    // Convert failed rows to flat structure
    const excelData = failedRows.map((item) => ({
      name: item.row?.name || "",
      email: item.row?.email || "",
      phone: item.row?.phone || "",
      jobTitle: item.row?.jobTitle || "",
      failureReason: item.reason || "Unknown error",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 40 },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FailedRows");

    // Download file
    XLSX.writeFile(workbook, "failed_job_applications.xlsx");
  };

  const handleDownloadTemplate = () => {
    // Define Excel headers
    const worksheetData = [
      {
        name: "",
        email: "",
        phone: "",
        jobTitle: "",
      },
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "JobApplications");

    // Download file
    XLSX.writeFile(workbook, "job_applications_bulk_upload_template.xlsx");
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedApplicant(null);
  };

  const uploadBulkResumes = async () => {
    if (!zipFile) return toast.error("Please select a ZIP file");

    try {
      toast.loading("Uploading resumes...");
      
      const formData = new FormData();
      formData.append("zip", zipFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/bulk-upload/resumes`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.dismiss();
      toast.success(
        `${response.data.successCount} resumes uploaded successfully!`
      );
      
      // Reset zip file
      setZipFile(null);
      
      // Refresh applications
      fetchApplications();
    } catch (err) {
      console.error("Resume upload error:", err);
      toast.dismiss();
      
      // Check if error is due to Google Drive not connected
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("Google Drive")
      ) {
        toast.error("Google Drive not connected. Connecting now...");
        setTimeout(() => {
          connectGoogleDrive();
        }, 1500);
        return;
      }
      
      toast.error(
        err.response?.data?.message || "Failed to upload resumes. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Job Applications
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Manage and track all job applicants</p>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {/* Tools Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center">
            <div className="h-1 w-1 bg-blue-400 rounded-full mr-3"></div>
            Tools & Uploads
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bulk Upload */}
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer flex-1">
                <input
                  id="excelFileInput"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <span className="block px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 font-medium hover:border-blue-500 hover:bg-slate-700 transition cursor-pointer text-center text-sm truncate">
                  {excelFile ? excelFile.name.substring(0, 12) + "..." : "📁 Excel File"}
                </span>
              </label>
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-blue-500/50 whitespace-nowrap"
                onClick={uploadExcelFiles}
                disabled={loading || !excelFile}
              >
                {loading ? "⏳" : "📤"}
              </button>
            </div>

            {/* Bulk Resume Upload */}
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer flex-1">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setZipFile(e.target.files[0])}
                  className="hidden"
                />
                <span className="block px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 font-medium hover:border-purple-500 hover:bg-slate-700 transition cursor-pointer text-center text-sm truncate">
                  📦 Resume ZIP
                </span>
              </label>
               <button
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-purple-500/50"
                onClick={uploadBulkResumes}
                disabled={!zipFile}
              >
                📤
              </button>
            </div>

            {/* Download Template */}
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2"
            >
              <span>📋</span> Template
            </button>

            {/* Google Drive Connection */}
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
              onClick={connectGoogleDrive}
            >
              <span>☁️</span> Google Drive
            </button>
          </div>

          {failedRows.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleDownloadFailedRows}
                className="w-full px-4 py-3 bg-red-600/20 text-red-300 border border-red-500/50 rounded-xl hover:bg-red-600/30 transition font-medium"
              >
                ⚠️ Download Failed Rows ({failedRows.length})
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex-grow flex items-center bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden hover:border-blue-500 transition shadow-lg">
              <Search className="mx-4 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-2 bg-transparent focus:outline-none text-slate-100 placeholder-slate-500"
              />
            </div>

            <select
              className="py-3 px-4 border border-slate-600 rounded-xl bg-slate-700/30 text-slate-100 font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="p-4 text-left font-semibold text-slate-300">Name</th>
                  <th className="p-4 text-left font-semibold text-slate-300">Email</th>
                  <th className="p-4 text-left font-semibold text-slate-300">Phone</th>
                  <th className="p-4 text-left font-semibold text-slate-300">Position</th>
                  <th className="p-4 text-left font-semibold text-slate-300">Status</th>
                  <th className="p-4 text-right font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications &&
                  filteredApplications.length !== 0 &&
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                      {console.log(app)}
                      <td className="p-4 text-slate-100 font-medium">{app.name}</td>
                      <td className="p-4 text-slate-400 text-sm">{app.email}</td>
                      <td className="p-4 text-slate-400 text-sm">{app.phone}</td>
                      <td className="p-4 text-slate-300">{app.jobTitle}</td>
                      <td className="p-4">
                        <select
                          className={`border rounded-lg p-2 text-xs font-medium transition ${
                            statusStyles[app.status]?.color || "text-gray-600"
                          } bg-slate-700/30 border-slate-600 hover:border-slate-500 focus:outline-none`}
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app._id, e.target.value)
                          }
                        >
                          {Object.keys(statusStyles).map((status) => (
                            <option key={status} value={status}>
                              {statusStyles[status].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex space-x-3 justify-end">
                          <button
                            className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition"
                            onClick={() => handleViewProfile(app.applicantId)}
                            title="View profile details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {app?.resume && app.resume !== "BULK_UPLOAD_PENDING" ? (
                            <button
                              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition"
                              onClick={() => handleViewResume(app)}
                              title="View resume"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                          ) : (
                            <button
                              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-orange-600/20 text-orange-300 border border-orange-500/50 rounded-lg hover:bg-orange-600/30 transition"
                              onClick={() => openResumeModal(app)}
                              title="Upload resume"
                            >
                              <FileText className="h-4 w-4" /> Upload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredApplications && filteredApplications.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No job applications found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicant Profile Modal */}
      {showProfileModal &&
      selectedApplicant &&
      typeof selectedApplicant === "object" ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
            {/* Modal Header with Gradient Background */}
            <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-600 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center space-x-5">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {selectedApplicant?.name || "Profile"}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Candidate Information
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition duration-200"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                {profileLoading ? (
                  <div className="text-center py-16">
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-4 border-t-blue-500"></div>
                    </div>
                    <p className="text-slate-400 font-medium">
                      Loading profile...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Contact Information Section */}
                    <div>
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-slate-100">
                          Contact Information
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-blue-900/30 to-transparent rounded-xl border border-blue-700/50 hover:border-blue-600 transition">
                          <Mail className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-400 font-semibold">
                              Email Address
                            </p>
                            <p className="text-slate-100 font-medium break-all">
                              {selectedApplicant?.email || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-green-900/30 to-transparent rounded-xl border border-green-700/50 hover:border-green-600 transition">
                          <Phone className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-400 font-semibold">
                              Phone Number
                            </p>
                            <p className="text-slate-100 font-medium">
                              {selectedApplicant?.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div>
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-slate-100">
                          Personal Details
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gradient-to-br from-purple-900/30 to-transparent rounded-xl border border-purple-700/50 hover:border-purple-600 transition">
                          <p className="text-sm text-slate-400 font-semibold mb-2">
                            Gender
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                            <p className="text-slate-100 font-medium">
                              {selectedApplicant?.gender || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Profiles Section */}
                    <div>
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-slate-100">
                          Social Profiles
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {selectedApplicant?.linkedIn && (
                          <a
                            href={selectedApplicant.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-900/40 to-transparent rounded-xl border border-blue-700/50 hover:border-blue-500 hover:bg-blue-900/50 transition transform hover:scale-105"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-blue-600 rounded-lg">
                                <Linkedin className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-400 font-semibold">
                                  LinkedIn
                                </p>
                                <p className="text-blue-400 font-medium truncate text-sm">
                                  {selectedApplicant.linkedIn}
                                </p>
                              </div>
                            </div>
                            <X className="h-5 w-5 text-slate-500" />
                          </a>
                        )}
                        {selectedApplicant?.github && (
                          <a
                            href={selectedApplicant.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-900/40 to-transparent rounded-xl border border-gray-700/50 hover:border-gray-600 hover:bg-gray-900/50 transition transform hover:scale-105"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gray-700 rounded-lg">
                                <Github className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-400 font-semibold">
                                  GitHub
                                </p>
                                <p className="text-gray-300 font-medium truncate text-sm">
                                  {selectedApplicant.github}
                                </p>
                              </div>
                            </div>
                            <X className="h-5 w-5 text-slate-500" />
                          </a>
                        )}
                        {!selectedApplicant?.linkedIn &&
                          !selectedApplicant?.github && (
                            <div className="p-5 text-center bg-slate-700/30 rounded-xl border border-slate-700">
                              <p className="text-slate-400 font-medium">
                                No social profiles added
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-900/50 border-t border-slate-700 px-8 py-5 flex justify-end space-x-3">
              <button
                onClick={closeProfileModal}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg transition transform hover:scale-105 active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Resume Upload Modal */}
      {resumeModalOpen && resumeTarget ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-7 space-y-6 border border-slate-700">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-100">
                📄 Upload Resume
              </h3>
              <button
                className="text-slate-400 hover:text-slate-200 transition"
                onClick={closeResumeModal}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-xl">
              <p className="text-sm text-slate-300">
                Candidate:{" "}
                <span className="font-bold text-blue-300">{resumeTarget.name}</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300">
                Select Resume File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full border-2 border-dashed border-slate-600 rounded-xl p-4 focus:outline-none focus:border-blue-500 transition text-slate-100 bg-slate-700/30 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              {resumeFile && (
                <p className="text-xs text-green-400 flex items-center">
                  ✓ {resumeFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                className="px-6 py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition font-medium"
                onClick={closeResumeModal}
                disabled={resumeUploading}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg hover:shadow-blue-500/50"
                onClick={handleResumeUpload}
                disabled={resumeUploading}
              >
                {resumeUploading ? "⏳ Uploading..." : "📤 Upload"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JobApplication;
