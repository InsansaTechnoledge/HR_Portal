import React, { useState } from "react";
import { Upload, File, Search, Trash2, Eye, Download } from "lucide-react";

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: "Employment Contract.pdf",
            type: "Contract",
            uploadDate: "2024-01-15",
            uploadedBy: "HR Department",
            employee: "John Doe",
        },
        {
            id: 2,
            name: "Performance Review 2023.docx",
            type: "Performance",
            uploadDate: "2024-02-20",
            uploadedBy: "John Doe",
            employee: "John Doe",
        },
        {
            id: 3,
            name: "Training Certificate.pdf",
            type: "Certificate",
            uploadDate: "2024-03-10",
            uploadedBy: "Jane Smith",
            employee: "Jane Smith",
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && selectedEmployee) {
            const newDocument = {
                id: documents.length + 1,
                name: file.name,
                type: file.type.split("/")[1]?.toUpperCase() || "Unknown",
                uploadDate: new Date().toISOString().split("T")[0],
                uploadedBy: "Current User",
                employee: selectedEmployee,
            };
            setDocuments([...documents, newDocument]);
            setSelectedFile(null);
        }
    };

    const handleDeleteDocument = (id) => {
        setDocuments(documents.filter((doc) => doc.id !== id));
    };

    const filteredDocuments = documents.filter(
        (doc) =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!selectedEmployee || doc.employee === selectedEmployee)
    );

    const employees = [...new Set(documents.map((doc) => doc.employee))];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Card */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-700">Document Management</h1>
                    <div className="flex items-center space-x-4">
                        <select
                            className="border rounded-lg p-2"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">All Employees</option>
                            {employees.map((employee) => (
                                <option key={employee} value={employee}>
                                    {employee}
                                </option>
                            ))}
                        </select>
                        <input
                            type="file"
                            id="fileUpload"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="fileUpload" className="cursor-pointer">
                            <button
                                className={`flex items-center px-4 py-2 ${selectedEmployee
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    } rounded-lg hover:bg-indigo-700`}
                                disabled={!selectedEmployee}
                            >
                                <Upload className="mr-2 h-4 w-4" /> Upload Document
                            </button>
                        </label>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="flex items-center border rounded-lg p-2 bg-gray-100">
                        <Search className="mr-2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
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
                                <tr key={doc.id} className="border-b">
                                    <td className="p-2 flex items-center">
                                        <File className="mr-2 text-blue-500" /> {doc.name}
                                    </td>
                                    <td className="p-2">{doc.type}</td>
                                    <td className="p-2">{doc.uploadDate}</td>
                                    <td className="p-2">{doc.uploadedBy}</td>
                                    <td className="p-2">{doc.employee}</td>
                                    <td className="p-2 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                                                <Eye className="mr-1 h-4 w-4" /> View
                                            </button>
                                            <button className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                                                <Download className="mr-1 h-4 w-4" /> Download
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredDocuments.length === 0 && (
                        <div className="text-center py-6 text-gray-500">No documents found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentManagement;
