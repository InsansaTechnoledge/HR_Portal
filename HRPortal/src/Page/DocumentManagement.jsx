import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Upload, File, Trash2, Eye, Download, Plus, X, FolderOpen, FileText, Filter, Calendar, Image as ImageIcon, ChevronDown, Loader2 } from "lucide-react";
import API_BASE_URL from "../config";
import { Search } from "lucide-react";
import no_doc_img from "/images/no-document.avif";
import { userContext } from "../Context/userContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../Components/ui/dialog";
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { toast } from "../hooks/useToast";

const UploadDocumentDialog = ({
  handleSubmit,
  handleFileChange,
  handleDrop,
  handleDragOver,
  formData,
  setFormData,
  fileName,
  user,
  employees,
  loading,
  setLoading,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </DialogTrigger>

      {/* Modal */}
      <DialogContent className="max-w-3xl" onOpenAutoFocus={(e) => {
        e.preventDefault(); // prevent auto focus jump
        document.getElementById("resume")?.focus();
      }}>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload and assign documents to employees
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
              await handleSubmit(e); // your upload logic
              document.activeElement?.blur();
              setOpen(false);        // close AFTER success
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Document File
              </label>

              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center w-full h-12 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/70 px-4"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <span className="text-sm text-muted-foreground">
                    {fileName ? (
                      <>
                        Selected:{" "}
                        <span className="font-medium">{fileName}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag & drop
                      </>
                    )}
                  </span>
                  <input
                    id="resume"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Document Type
              </label>
              <div className="relative">
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="w-full p-2 rounded-lg border">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Uploaded By */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Uploaded By
              </label>
              <input
                type="text"
                value={user.userName}
                disabled
                className="w-full p-2 border rounded-lg bg-muted cursor-not-allowed"
              />
            </div>

            {/* Employee */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Employee
              </label>
              <div className="relative">
                <Select
                  value={formData.employeeEmail}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      employeeEmail: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full p-2 rounded-lg border">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>

                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp.email}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DocumentManagement = () => {


  const [documents, setDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);

  const [fileName, setFileName] = useState("No file choosen")
  const { user } = useContext(userContext);
  const [employees, setEmployees] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [toastSuccessMessage, setToastSuccessMessage] = useState();
  const [toastErrorMessage, setToastErrorMessage] = useState();
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);

  const [sortByDate, setSortByDate] = useState("latest");

  const [docStats, setDocStats] = useState({
    total: 0,
    pdf: 0,
    docx: 0,
    xlsx: 0,
  });
  // Upload form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    uploadedBy: user.userName,
    email: '',
    document: null
  });
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!user || user.role === "user") return;

    const fetchEmployees = async () => {
      const response = await axios.get(`${API_BASE_URL}/api/employee`);
      const empList = response.data.employees;
      setEmployees(empList);

      if (response.status === 200) {
        if (response.data.employees.length > 0) {
          setFormData(prev => ({
            ...prev,
            employeeEmail: response.data.employees[0].email
          }));
        }
      }
      if (response.status === 500) {
        toast({
          variant: "destructive",
          title: "Fetch Failed",
          description: "Failed to fetch employees.",
        });
      }
    }

    fetchEmployees();
  }, [user]);

  const selectedEmployee = employees.find(
    emp => emp.email === formData.employeeEmail
  );

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
    setFormData(prev => ({
      ...prev,
      name: file.name,
      document: file
    }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        uploadedBy: user.userName
      }));
    }
  }, [user]);


  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/api/documents/all`);
      const allDocs = Array.isArray(res.data.data) ? res.data.data : [];

      // Role-based filtering
      const visibleDocs = isAdmin
        ? allDocs
        : allDocs.filter(doc => doc.employeeEmail === user?.userEmail);

      // Calculate stats from visible docs
      const stats = {
        total: visibleDocs.length,
        pdf: 0,
        docx: 0,
        xlsx: 0,
      };

      visibleDocs.forEach(doc => {
        const type = doc.type?.toLowerCase();
        if (type === "pdf") stats.pdf++;
        if (type === "docx") stats.docx++;
        if (type === "xlsx") stats.xlsx++;
      });

      //Update state
      setDocuments(visibleDocs);
      setDocStats(stats);

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: err.response?.data?.message || "Failed to fetch documents.",
      });
    } finally {
      setLoading(false);
    }
  };


  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'image/png',
        'image/jpeg'
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        setError(`File type not allowed. Please upload PDF, DOCX, XLSX, PNG, or JPG files only.`);
        toast({
          variant: "destructive",
          title: `${file.type} not allowed`,
          description: `File type not allowed. Please upload PDF, DOCX, XLSX, PNG, or JPG files only.`,
        });
        return;
      }

      setFileName(file.name)
      setError("");
    }
    setFormData(prev => ({
      ...prev,
      name: file.name,
      document: file
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!formData.document || !formData.employeeEmail || !formData.type) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    const uploadData = new FormData();
    uploadData.append('document', formData.document);
    uploadData.append('name', formData.name);
    uploadData.append('type', formData.type);
    uploadData.append('uploadedBy', formData.uploadedBy);
    uploadData.append('employee', selectedEmployee?.name);
    uploadData.append('email', selectedEmployee?.email);
    uploadData.append('size', formData.document.size);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/documents/upload/${selectedEmployee.email}`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        name: '',
        type: '',
        document: null
      }));

      if (response.status === 201) {
        toast({
          variant: "success",
          title: "Document Uploaded",
          description: "The document has been uploaded successfully.",
        });
      }
      setLoading(false);
      setShowUploadForm(false);
      fetchDocuments();
      setFileName("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.response?.data?.message || "Failed to upload document.",
      });
      setLoading(false);

    } finally {
      setLoading(false);
    }
  };


  // Handle document deletion
  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/documents/delete/${selectedId}`);
      setShowDeleteModal(false);
      toast({
        variant: "success",
        title: "Document Deleted",
        description: "The document has been deleted successfully.",
      });

      setSelectedId("");
      fetchDocuments();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err.response?.data?.message || "Failed to delete document.",
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Add this state for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered documents based on search input
  const filteredDocuments = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();

    return (
      doc.name?.toLowerCase().includes(term) ||
      doc.type?.toLowerCase().includes(term) ||
      doc.uploadedBy?.toLowerCase().includes(term) ||
      doc.employee?.toLowerCase().includes(term)
    );
  });

  const viewDocument = (doc) => {
    if (!doc?.url) {
      toast({
        variant: "destructive",
        title: "Preview unavailable",
        description: "Document URL not found",
      });
      return;
    }

    const type = doc.type?.toUpperCase();

    // Native browser preview
    if (type === "PDF" || type === "IMAGE") {
      window.open(doc.url, "_blank");
      return;
    }

    // Google Docs Viewer (DOCX, XLSX)
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      doc.url
    )}&embedded=true`;

    window.open(googleViewerUrl, "_blank");
  };




  const downloadDocument = async (doc) => {
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/api/documents/download/${doc._id}`;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  //File type icon switch
  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-destructive" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-info" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">Manage and organize your documents</p>
          </div>

          {/*Uplaod Document Button*/}
          {user && user.role !== 'user' && (<UploadDocumentDialog
            handleSubmit={handleSubmit}
            handleFileChange={handleFileChange}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            formData={formData}
            setFormData={setFormData}
            fileName={fileName}
            user={user}
            employees={employees}
            loading={loading}
            setLoading={setLoading}
          />)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: docStats.total, icon: FolderOpen, color: 'text-primary' },
            { label: 'PDF Files', value: docStats.pdf, icon: FileText, color: 'text-destructive' },
            { label: 'Docs Files', value: docStats.docx, icon: ImageIcon, color: 'text-info' },
            { label: 'Excel Files', value: docStats.xlsx, icon: File, color: 'text-hr-amber' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filter */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                {/* {user && user.role !== 'user' && (
                      <> */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* </>
                    )} */}
              </div>
              <div className="flex gap-2">
                {/* <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                    </Button> */}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    setSortByDate(prev => (prev === "latest" ? "oldest" : "latest"))
                  }
                >
                  <Calendar className={`w-4 h-4 transition-transform ${sortByDate === "latest" ? "" : "rotate-180"
                    }`} />
                  {sortByDate === "latest" ? "Latest" : "Oldest"}
                </Button>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            {isAdmin ?
              <CardTitle className="text-lg">Recent Documents</CardTitle>
              :
              <CardTitle className="text-lg">Employee Documents</CardTitle>
            }
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredDocuments.length === 0 && (
                <p className="p-6 text-center text-muted-foreground">
                  No documents found
                </p>
              )}
              {[...filteredDocuments]
                .sort((a, b) => {
                  const dateA = new Date(a.createdAt || a.uploadDate);
                  const dateB = new Date(b.createdAt || b.uploadDate);

                  return sortByDate === "latest"
                    ? dateB - dateA
                    : dateA - dateB;
                }).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="p-3 rounded-xl bg-secondary">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0 sm:hidden">
                        <p className="font-medium truncate">{doc.name}</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 hidden sm:block">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{format(doc.uploadDate, 'dd-MM-yyyy')}</span>
                        {/* <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-secondary text-xs">
                                    {doc.category}
                                </span> */}
                      </div>
                    </div>

                    {/* Mobile View Details */}
                    <div className="sm:hidden pl-[52px] -mt-2">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{format(doc.uploadDate, 'dd-MM-yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto pl-[52px] sm:pl-0">
                      <Button variant="ghost" size="icon-sm" onClick={() => viewDocument(doc)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => downloadDocument(doc)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      {isAdmin &&
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => openDeleteModal(doc._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Document?
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this file?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;