import React, { useState } from 'react';
import axios from 'axios';
import UploadFile from './UploadFile';
import API_BASE_URL from '../../config';

function DocumentUploadForm(props) {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        uploadedBy: '',
        employee: '',
        document: null
    });

    
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
            props.setLoading(true);
            await axios.post(`${API_BASE_URL}/api/documents/upload`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData({ name: '', type: '', uploadedBy: '', employee: '', document: null });
            setShowUploadForm(false);
            fetchDocuments();
            props.setLoading(false);
        } catch (err) {
            setError("Failed to upload document");
            props.setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Document File</label>
                        <UploadFile setFormData={setFormData}/>
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
                        <label className="block text-gray-700 mb-2">Employee Username</label>
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
        </div>
    );
}

export default DocumentUploadForm;
