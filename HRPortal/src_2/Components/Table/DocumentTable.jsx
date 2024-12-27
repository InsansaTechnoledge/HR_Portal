import React, { useEffect } from 'react';
import axios from 'axios';
import { File, Eye, Download, Trash2 } from 'react-feather';
import API_BASE_URL from '../../config';

function DocumentTable(props) {

    useEffect(() => {
            fetchDocuments();
        }, []);
    
    
        // Fetch all documents
        const fetchDocuments = async () => {
            try {
                props.setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/documents/all`);
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                
                console.log(data);
    
                if (props.user && props.user.role === "user") {
                    const filteredData = data.filter(doc => doc.employee.toLowerCase() === props.user.userName.toLowerCase());
                    props.setDocuments(filteredData);
                } else {
                    props.setDocuments(data);
                }
                
                props.setLoading(false);
            } catch (err) {
                props.setError("Failed to fetch documents");
                props.setLoading(false);
            }
        };
    

    // Handle document deletion
    const handleDeleteDocument = async (id) => {
        try {
            props.setLoading(true);
            await axios.delete(`${API_BASE_URL}/api/documents/delete/${id}`);
            fetchDocuments();
            props.setLoading(false);
        } catch (err) {
            props.setError("Failed to delete document");
            props.setLoading(false);
        }
    };

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
        <div>
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
                    {props.filteredDocuments.map((doc) => (
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
                                {
                                    props.user && props.user.role === "user"
                                        ?
                                        null
                                        :
                                        <button onClick={() => handleDeleteDocument(doc._id)}
                                            className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                                        </button>

                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default DocumentTable