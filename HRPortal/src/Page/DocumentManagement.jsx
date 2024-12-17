import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, File, Trash2, Eye, Download, Plus, X } from "lucide-react";
import API_BASE_URL from "../config";
import { Search } from "lucide-react";
import no_doc_img from "/images/no-document.avif"; 

const DocumentManagement = () => {


    const [documents, setDocuments] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("No file choosen")

    // Upload form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        uploadedBy: '',
        employee: '',
        document: null
    });

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
          setFileName(file.name);
        }
    };

    const handleDragOver = (event) => {
    event.preventDefault();
    };

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
        if (file) {
            setFileName(file.name)
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

            if (!response.ok) {
                throw new Error(`Failed to fetch document: ${response.statusText}`);
            }

            const blob = await response.blob();

            const url = URL.createObjectURL(blob);

            window.open(url, "_blank");

            setTimeout(() => URL.revokeObjectURL(url), 10000); // Revoke after 10 seconds
        } catch (error) {
            console.error("Error viewing the document:", error);
        }
    }

    return (

        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Error Message */}
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

            {/* No Documents Message at the Top */}
            {filteredDocuments.length === 0 && (
                <div className="bg-gradient-to-r from-red-400 to-red-600 text-white px-6 py-4 mb-8 rounded-lg shadow-lg text-center">
                <span className="block text-xl font-bold tracking-wide">No documents found</span>
            </div>
            
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Header */}
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

                {/* Upload Form */}
                {showUploadForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Document File</label>
                                {/* <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full p-2 border rounded-lg"
                                /> */}
                                <div class="flex items-center justify-center w-full">
                                    <label for="resume" class="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        >
                                        <div class="flex items-center justify-center">
                                            <svg class="w-8 h-8 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            {fileName ?
                                                (
                                                    <p className="ml-3 text-sm text-gray-500">
                                                        Selected file: <span className="font-medium">{fileName}</span>
                                                    </p>
                                                )
                                                :
                                                (<p class="ml-3 text-sm text-gray-500 "><span class="font-semibold">Click to upload</span> or drag and drop</p>)
                                            }
                                        </div>
                                        <input id="resume" type="file" class="hidden" onChange={handleFileChange} />
                                    </label>

                                </div>
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

                {/* Table and Search */}
                <div className="overflow-x-auto">
                    <div className="mb-4 flex items-center">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                            <div className="absolute left-3 top-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
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
                </div>
            </div>
                    {
                        error ? 
                    <div className="mt-4 flex justify-center items-center">
                        <img
                        className="rounded-full md:w-4/12 w-8/12" 
                        src={no_doc_img}></img>
                    </div>
                    :
                    null    
                }
        </div>

    );
};

export default DocumentManagement;
