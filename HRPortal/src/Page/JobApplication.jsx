import React, { useState,useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { Eye, FileText, Search, Check, X, Clock } from 'lucide-react';

const JobApplication = () => {
    const [applications, setApplications] = useState([]);


    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try{
        console.log("Fetching applications...");
        const response=await axios.get(`${API_BASE_URL}/api/job/applications`);
        console.log(response.data.JobApplications);
        setApplications(response.data.JobApplications);
        }catch(err){
            console.error("Error fetching applications:",err);
            setApplications([]);
        };
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const statusStyles = {
        'Under Review': {
            color: 'text-yellow-600',
            icon: <Clock className="inline mr-2" />,
            label: 'Under Review',
        },
        'Selected': {
            color: 'text-green-600',
            icon: <Check className="inline mr-2" />,
            label: 'Selected',
        },
        'Rejected': {
            color: 'text-red-600',
            icon: <X className="inline mr-2" />,
            label: 'Rejected',
        },
    };

    const handleStatusChange = (id, newStatus) => {
        setApplications((apps) =>
            apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
    };

    const [filteredApplications, setFilteredApplications] = useState();   

    useEffect(()=>{
        if(applications && searchTerm!==''){
            setFilteredApplications(applications.filter(
                (app) =>
                    (searchTerm === '' ||
                        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (statusFilter === '' || app.status === statusFilter)
            ));

            console.log("Filtered Applications:",filteredApplications);
        }
        else{
            setFilteredApplications(applications);
            console.log("Filtered Applications:",applications);
        }
    },[applications]);


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-xl font-bold text-gray-700 mb-4">Job Applications</h1>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                    <div className="flex-grow flex items-center mb-4 md:mb-0">
                        <Search className="mr-2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg p-2 bg-gray-100 focus:outline-none"
                        />
                    </div>
                    <div>
                        <select
                            className="border rounded-lg p-2 bg-gray-100 focus:outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="under-review">Under Review</option>
                            <option value="selected">Selected</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 text-left font-semibold text-gray-700">Name</th>
                                <th className="p-2 text-left font-semibold text-gray-700">Email</th>
                                <th className="p-2 text-left font-semibold text-gray-700">Phone</th>
                                <th className="p-2 text-left font-semibold text-gray-700">Position</th>
                                <th className="p-2 text-left font-semibold text-gray-700">Applied Date</th>
                                <th className="p-2 text-left font-semibold text-gray-700">Status</th>
                                <th className="p-2 text-right font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications && filteredApplications.length!==0 &&  filteredApplications.map((app) => (
                                <tr key={app.id} className="border-b hover:bg-gray-100">
                                    {console.log(app)}
                                    <td className="p-2 text-gray-700">{app.name}</td>
                                    <td className="p-2 text-gray-700">{app.email}</td>
                                    <td className="p-2 text-gray-700">{app.phone}</td>
                                    <td className="p-2 text-gray-700">{app.position}</td>
                                    <td className="p-2 text-gray-700">{app.appliedDate}</td>
                                    <td className="p-2">
                                        <select
                                            className={`border rounded-lg p-2 ${statusStyles[app.status].color} focus:outline-none`}
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
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
                                            <button className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                                                <Eye className="mr-1 h-4 w-4" /> View Profile
                                            </button>
                                            <button className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
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
        </div>
    );
};

export default JobApplication;