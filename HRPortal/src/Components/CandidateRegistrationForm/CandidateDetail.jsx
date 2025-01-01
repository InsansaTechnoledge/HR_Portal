import React, { useEffect, useState, useMemo } from 'react';
import {
    Download,
    Linkedin,
    User,
    Monitor,
    Building,
    Mail,
    Phone,
    Search,
    X
} from 'lucide-react';
import API_BASE_URL from '../../config';
import axios from 'axios';
import no_candidate from "/images/no-candidate.avif"
import ErrorToast from '../Toaster/ErrorToaster.jsx'
import SuccessToast from '../Toaster/SuccessToaser.jsx';

const CandidatesTable = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
        const [toastErrorMessage, setToastErrorMessage] = useState();
        const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
        const [toastErrorVisible, setToastErrorVisible] = useState(false);

    const iconsMap = {
        name: User,
        technology: Monitor,
        client: Building,
        email: Mail,
        contact_no: Phone,
        linkedIn: Linkedin,
        resume: Download,
    };

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/candidate/candidates`);
                setCandidates(response.data);
            } catch (err) {
                console.error('Error fetching candidates:', err.message);
                setError('Failed to fetch candidates.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const downloadResume = (resume, candidateName) => {
        try {
            if (!resume || !resume.data) {
                console.error('No resume data available');
                return;
            }

            // Convert data to Uint8Array if it's not already
            const resumeData = resume.data instanceof ArrayBuffer
                ? new Uint8Array(resume.data)
                : typeof resume.data === 'string'
                    ? new TextEncoder().encode(resume.data)
                    : resume.data;

            // Create a base64 encoded PDF
            const base64Pdf = btoa(
                String.fromCharCode.apply(null, resumeData)
            );

            // Create a download link
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${base64Pdf}`;
            link.download = `${candidateName}_Resume.pdf`;

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            // console.error('Error downloading resume:', err);
            // alert('Failed to download resume');
            setToastErrorMessage('Failed to download resume');
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
        }
    };

    const filteredCandidates = useMemo(() => {
        if (!searchTerm) return candidates;

        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return candidates.filter(candidate =>
            Object.values(candidate).some(value =>
                value &&
                value.toString().toLowerCase().includes(lowercasedSearchTerm)
            )
        );
    }, [candidates, searchTerm]);

    const renderField = (field, value, candidate) => {
        const Icon = iconsMap[field];

        if (field === 'linkedIn' && value) {
            return (
                <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-2 text-blue-500" />
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        LinkedIn
                    </a>
                </div>
            );
        }

        // Handle Resume Field
        if (field === 'resume') {
            if (value?.data) {
                try {
                    const blob = new Blob([new Uint8Array(value.data)], {
                        type: 'application/pdf',
                    });

                    // Generate a blob URL
                    const href = URL.createObjectURL(blob);

                    return (
                        <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-2 text-blue-400" />
                            <a
                                href={href}
                                download={`${candidate.name}.pdf`} // Use candidate name only
                                className="text-blue-600 hover:underline"
                            >
                                Download Resume
                            </a>
                        </div>
                    );
                } catch (err) {
                    console.error('Error rendering resume:', err);
                    return null;
                }
            }
        }

        // Default Rendering for Other Fields
        if (typeof value === 'string' || typeof value === 'number') {
            return (
                <div className="flex items-center">
                    {Icon && <Icon className="w-4 h-4 mr-2 text-blue-400" />}
                    <span>{value}</span>
                </div>
            );
        }

        return null;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    // Show loader when data is loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error}
            </div>
        );
    }

    return (
        <>
        {
            toastSuccessVisible ? <SuccessToast message={toastSuccessMessage}/> : null
        }
        {
            toastErrorVisible ? <ErrorToast error={toastErrorMessage}/> : null
        }
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Candidate Roster
                </h1>

                {/* Search Input */}
                <div className="mb-6 flex justify-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredCandidates.length > 0 ? (
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    {['Name', 'Technology', 'Client', 'Email', 'Contact', 'LinkedIn', 'Resume'].map((header) => (
                                        <th key={header} className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCandidates.map((candidate) => (
                                    <tr key={candidate.candidateId} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3">{renderField('name', candidate.name, candidate)}</td>
                                        <td className="p-3">{renderField('technology', candidate.technology, candidate)}</td>
                                        <td className="p-3">{renderField('client', candidate.client, candidate)}</td>
                                        <td className="p-3">{renderField('email', candidate.email, candidate)}</td>
                                        <td className="p-3">{renderField('contact_no', candidate.contact_no, candidate)}</td>
                                        <td className="p-3">{renderField('linkedIn', candidate.linkedIn, candidate)}</td>
                                        <td className="p-3">{renderField('resume', candidate.resume, candidate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                    <div className="text-center text-gray-500 text-xl">
                        No candidates found.
                    </div>
                    <div className="mt-16 flex justify-center items-center">
                    <img
                        className="rounded-full md:w-6/12 w-8/12"
                        src={no_candidate}></img>
                        
                </div>
                </>
                )}
            </div>
        </div>
        </>
    );
};

export default CandidatesTable;
