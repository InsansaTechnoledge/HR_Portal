import React, { useState, useContext } from "react";
import { Plus, X } from "lucide-react";
import no_doc_img from "/images/no-document.avif"; 
import { userContext } from "../Context/userContext";
import DocumentUploadForm from "../Components/UploadComponents/documentUploadForm";
import DocumentTable from "../Components/Table/DocumentTable";
import SearchComponent from "../Components/Search/searchComponent";
const DocumentManagement = () => {


    const [documents, setDocuments] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {user} = useContext(userContext);

    // Add this state for search functionality
    const [searchTerm, setSearchTerm] = useState("");

    // Filtered documents based on search input
    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee.toLowerCase().includes(searchTerm.toLowerCase())
    );
    

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
                    {
                        user.role==="user" ? null :
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
                    }
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <DocumentUploadForm setLoading={setLoading}/>
                )}

                {/* Table and Search */}
                <div className="overflow-x-auto">
                    <SearchComponent searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>

                    {/* Table */}
                    <DocumentTable setLoading={setLoading} setDocuments={setDocuments} setError={setError} filteredDocuments={filteredDocuments} user={user} />
                </div>
            </div>
                    {
                        documents.length===0 ? 
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
