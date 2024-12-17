import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, File, Trash2, Eye, Download, Plus, X } from "lucide-react";
import API_BASE_URL from "../config";
import { Search } from "lucide-react";


const DocumentManagement = () => {

    
    const [documents, setDocuments] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Upload form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        uploadedBy: '',
        employee: '',
        document: null
    });

    // Fetch documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Fetch all documents
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/documents/all`);
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setDocuments(data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch documents");
            setLoading(false);
        }
    };

    // Handle input changes in upload form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            name: file.name,
            document: file
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.document || !formData.uploadedBy || !formData.employee || !formData.type) {
            setError("Please fill in all required fields");
            return;
        }

        const uploadData = new FormData();
        uploadData.append('document', formData.document);
        uploadData.append('name', formData.name);
        uploadData.append('type', formData.type);
        uploadData.append('uploadedBy', formData.uploadedBy);
        uploadData.append('employee', formData.employee);
        uploadData.append('size', formData.document.size);

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/api/documents/upload`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData({ name: '', type: '', uploadedBy: '', employee: '', document: null });
            setShowUploadForm(false);
            fetchDocuments();
            setLoading(false);
        } catch (err) {
            setError("Failed to upload document");
            setLoading(false);
        }
    };

    // Handle document deletion
    const handleDeleteDocument = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${API_BASE_URL}/api/documents/delete/${id}`);
            fetchDocuments();
            setLoading(false);
        } catch (err) {
            setError("Failed to delete document");
            setLoading(false);
        }
    };

    // Add this state for search functionality
    const [searchTerm, setSearchTerm] = useState("");

    // Filtered documents based on search input
    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const viewDocument = async (doc) => {
        try {
          // Fetch the document data as a buffer array from the API
          const response = await fetch(`${API_BASE_URL}/api/documents/view/${doc._id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/pdf', // Specify the expected document type
            }
          });
      
          // Check if the response is OK
          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }
      
          // Convert the response into a blob
          const blob = await response.blob();
      
          // Create a temporary URL for the blob
          const url = URL.createObjectURL(blob);
      
          // Open the document in a new tab
          window.open(url, "_blank");
      
          // Optional: Revoke the URL after some time to release memory
          setTimeout(() => URL.revokeObjectURL(url), 10000); // Revoke after 10 seconds
        } catch (error) {
          console.error("Error viewing the document:", error);
        }
      }

    return (
        
        <div className="p-6 bg-gray-50 min-h-screen">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <span
                        onClick={() => setError(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </span>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-700">Document Management</h1>
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        {showUploadForm ? (
                            <>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" /> Upload Document
                            </>
                        )}
                    </button>
                </div>

                {showUploadForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Document File</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Document Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">Select Type</option>
                                    <option value="PDF">PDF</option>
                                    <option value="DOCX">DOCX</option>
                                    <option value="XLSX">XLSX</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Uploaded By</label>
                                <input
                                    type="text"
                                    name="uploadedBy"
                                    value={formData.uploadedBy}
                                    onChange={handleInputChange}
                                    placeholder="Your Name"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Employee Name</label>
                                <input
                                    type="text"
                                    name="employee"
                                    value={formData.employee}
                                    onChange={handleInputChange}
                                    placeholder="Employee Name"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Upload Document
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <div className="mb-4 flex items-center">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border rounded-lg "
                            />
                            <div className="absolute left-3 top-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 font-semibold text-gray-700">Document Name</th>
                                <th className="p-2 font-semibold text-gray-700">Type</th>
                                <th className="p-2 font-semibold text-gray-700">Upload Date</th>
                                <th className="p-2 font-semibold text-gray-700">Uploaded By</th>
                                <th className="p-2 font-semibold text-gray-700">Employee</th>
                                <th className="p-2 font-semibold text-right text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map((doc) => (
                                <tr key={doc._id} className="border-b">
                                    <td className="p-2 flex items-center">
                                        <File className="mr-2 text-blue-500" /> {doc.name}
                                    </td>
                                    <td className="p-2">{doc.type}</td>
                                    <td className="p-2">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                    <td className="p-2">{doc.uploadedBy}</td>
                                    <td className="p-2">{doc.employee}</td>
                                    <td className="p-2 text-right flex space-x-2 justify-end">
                                        <button 
                                        disabled
                                        onClick={() => { viewDocument(doc) }}
                                            className="cursor-not-allowed flex items-center px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                                            <Eye className="mr-1 h-4 w-4" /> View
                                        </button>
                                        <a href={`${API_BASE_URL}/api/documents/download/${doc._id}`}
                                            className="flex items-center px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                                            <Download className="mr-1 h-4 w-4" /> Download
                                        </a>
                                        <button onClick={() => handleDeleteDocument(doc._id)}
                                            className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {documents.length === 0 && (
                        <div className="text-center py-6 text-gray-500">No documents found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentManagement;
