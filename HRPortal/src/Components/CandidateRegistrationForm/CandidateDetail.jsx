import React, { useEffect, useState } from 'react';
import { Download, Linkedin, User, Monitor, Building, Mail, Phone } from 'lucide-react';
import API_BASE_URL from '../../config';
import axios from 'axios';

const CandidatesList = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                console.log(response.data)
            } catch (err) {
                console.error('Error fetching candidates:', err.message);
                setError('Failed to fetch candidates.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

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

    const renderField = (field, value) => {
        const Icon = iconsMap[field];

        // Handle LinkedIn Field
        if (field === 'linkedIn' && value) {
            return (
                <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-blue-400" />
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        LinkedIn Profile
                    </a>
                </div>
            );
        }

        // Handle Resume Field
        if (field === 'resume'){
            console.log("rendering resume for", value)
            if(value?.data) {
                console.log(value?.data)
            try {
                // Create a Blob from binary data
            const blob = new Blob([new Uint8Array(value.data)], {
                type: 'application/pdf', // Use 'application/pdf' or 'application/msword' as appropriate
            });

            // Generate a blob URL
            const href = URL.createObjectURL(blob);

            return (
                <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-blue-400" />
                    <a
                        href={href}
                        download={`${value.name || "resume"}_Resume.pdf`}
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
                    {Icon && <Icon className="w-5 h-5 mr-2 text-blue-400" />}
                    <span>
                        <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {value}
                    </span>
                </div>
            );
        }

        // Return null for unsupported types
        return null;
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Candidate Roster
                </h1>

                {candidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map((candidate) => (
                            <div
                                key={candidate.candidateId}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2"
                            >
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{candidate.name}</h2>
                                    <div className="space-y-3 text-gray-600">
                                        {candidates ? Object.keys(candidate).map((field) =>
                                            candidate[field] ? renderField(field, candidate[field]) : null
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 text-xl">
                        No candidates found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidatesList;
