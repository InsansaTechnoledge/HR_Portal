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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-700 mb-4">
          Job Applications
        </h1>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 md:gap-3 md:flex-row md:items-center mb-6">
          <div className="flex-grow flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:border-blue-500 transition">
            <Search className="mx-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applicants by name, email or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 px-2 bg-white focus:outline-none text-gray-700"
            />
          </div>
          
          <select
            className="py-2.5 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="relative cursor-pointer">
              <input
                id="excelFileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <span className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:border-blue-500 hover:bg-gray-50 transition cursor-pointer inline-block shadow-sm">
                {excelFile ? excelFile.name.substring(0, 15) + "..." : "Choose File"}
              </span>
            </label>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              onClick={uploadExcelFiles}
              disabled={loading || !excelFile}
            >
              {loading ? "Uploading..." : "Bulk Upload"}
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-sm"
          >
            Download Template
          </button>

          {failedRows.length > 0 && (
            <button onClick={handleDownloadFailedRows}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Download Failed Rows
            </button>
          )}
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-semibold text-gray-700">
                  Name
                </th>
                <th className="p-2 text-left font-semibold text-gray-700">
                  Email
                </th>
                <th className="p-2 text-left font-semibold text-gray-700">
                  Phone
                </th>
                <th className="p-2 text-left font-semibold text-gray-700">
                  Position
                </th>
                <th className="p-2 text-left font-semibold text-gray-700">
                  Applied Date
                </th>
                <th className="p-2 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications &&
                filteredApplications.length !== 0 &&
                filteredApplications.map((app) => (
                  <tr key={app._id} className="border-b hover:bg-gray-100">
                    {console.log(app)}
                    <td className="p-2 text-gray-700">{app.name}</td>
                    <td className="p-2 text-gray-700">{app.email}</td>
                    <td className="p-2 text-gray-700">{app.phone}</td>
                    <td className="p-2 text-gray-700">{app.position}</td>
                    <td className="p-2 text-gray-700">{app.applicationDate}</td>
                    <td className="p-2">
                      <select
                        className={`border rounded-lg p-2 ${
                          statusStyles[app.status]?.color || "text-gray-600"
                        } focus:outline-none`}
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
                    <td className="p-2 text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                          onClick={() => handleViewProfile(app.applicantId)}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View Profile
                        </button>
                        <button
                          className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                          onClick={() => window.open(app.resumeLink, "_blank")}
                        >
                          <FileText className="mr-1 h-4 w-4" /> View Resume
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filteredApplications && filteredApplications.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No job applications found
            </div>
          )}
        </div>
      </div>

      {/* Applicant Profile Modal */}
      {showProfileModal &&
      selectedApplicant &&
      typeof selectedApplicant === "object" ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
            {/* Modal Header with Gradient Background */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-8 relative overflow-hidden">
              {/* Decorative elements */}
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
                      Professional Profile
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition duration-200 transform hover:scale-110"
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
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-4 border-t-blue-600"></div>
                    </div>
                    <p className="text-gray-600 font-medium">
                      Loading profile...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Contact Information Section */}
                    <div>
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Contact Information
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-blue-50 to-transparent rounded-xl border border-blue-100 hover:shadow-md transition">
                          <Mail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 font-semibold">
                              Email Address
                            </p>
                            <p className="text-gray-800 font-medium break-all">
                              {selectedApplicant?.email || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-green-50 to-transparent rounded-xl border border-green-100 hover:shadow-md transition">
                          <Phone className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 font-semibold">
                              Phone Number
                            </p>
                            <p className="text-gray-800 font-medium">
                              {selectedApplicant?.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div>
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="h-1 w-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Personal Details
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gradient-to-br from-purple-50 to-transparent rounded-xl border border-purple-100 hover:shadow-md transition">
                          <p className="text-sm text-gray-600 font-semibold mb-2">
                            Gender
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                            <p className="text-gray-800 font-medium">
                              {selectedApplicant?.gender || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Profiles Section */}
                    <div>
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="h-1 w-8 bg-gradient-to-r from-pink-600 to-red-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Social Profiles
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {selectedApplicant?.linkedIn && (
                          <a
                            href={selectedApplicant.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-transparent rounded-xl border border-blue-200 hover:shadow-lg hover:border-blue-400 transition transform hover:scale-105"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-blue-600 rounded-lg">
                                <Linkedin className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-semibold">
                                  LinkedIn
                                </p>
                                <p className="text-blue-600 font-medium truncate text-sm">
                                  {selectedApplicant.linkedIn}
                                </p>
                              </div>
                            </div>
                            <X className="h-5 w-5 text-gray-400" />
                          </a>
                        )}
                        {selectedApplicant?.github && (
                          <a
                            href={selectedApplicant.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-transparent rounded-xl border border-gray-300 hover:shadow-lg hover:border-gray-500 transition transform hover:scale-105"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gray-800 rounded-lg">
                                <Github className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-semibold">
                                  GitHub
                                </p>
                                <p className="text-gray-700 font-medium truncate text-sm">
                                  {selectedApplicant.github}
                                </p>
                              </div>
                            </div>
                            <X className="h-5 w-5 text-gray-400" />
                          </a>
                        )}
                        {!selectedApplicant?.linkedIn &&
                          !selectedApplicant?.github && (
                            <div className="p-5 text-center bg-gray-50 rounded-xl border border-gray-200">
                              <p className="text-gray-500 font-medium">
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
            <div className="bg-gray-50 border-t px-8 py-5 flex justify-end space-x-3">
              <button
                onClick={closeProfileModal}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JobApplication;
