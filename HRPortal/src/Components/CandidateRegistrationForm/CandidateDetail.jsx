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
    X,
    DownloadIcon,
    MoreHorizontal,
    Calendar,
    Filter,
    Eye
} from 'lucide-react';
import API_BASE_URL from '../../config';
import axios from 'axios';
import no_candidate from "/images/no-candidate.avif"
import ErrorToast from '../Toaster/ErrorToaster.jsx'
import SuccessToast from '../Toaster/SuccessToaser.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import Loader from '../Loader/Loader.jsx'
import { toast } from '../../hooks/useToast.js';

const CandidatesTable = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
    const [toastErrorMessage, setToastErrorMessage] = useState();
    const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
    const [toastErrorVisible, setToastErrorVisible] = useState(false);

    const [openProfile, setOpenProfile] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

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
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch candidates.",
                });
                // setError('Failed to fetch candidates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const downloadResume = (resume, candidateName) => {
        try {
            if (!resume || !resume.data) {
                throw new Error("Resume data not found");
            }

            // resume.data is the buffer array from MongoDB
            const byteArray = new Uint8Array(resume.data);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${candidateName}_Resume.pdf`;
            link.click();

            URL.revokeObjectURL(url);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Download Error",
                description: err.message || "Failed to download resume.",
            });
            console.error("Error downloading resume:", err.message);
        }
    };



    const filteredCandidates = useMemo(() => {
        if (!searchTerm.trim()) return candidates;

        const q = searchTerm.toLowerCase();

        return candidates.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.technology?.toLowerCase().includes(q) ||
            c.client?.toLowerCase().includes(q) ||
            c.source?.toLowerCase().includes(q)
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
            const hasResume = value && value.data;
            return (
                <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-blue-400" />
                    {hasResume ? (
                        <button
                            onClick={() => downloadResume(value, candidate.name)}
                            className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                            Download Resume
                        </button>
                    ) : (
                        <span className="text-gray-400">No Resume</span>
                    )}
                </div>
            );
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
            <Loader />
        );
    }

    return (
        <>
            {/* <div className="bg-gray-50 min-h-screen p-8">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Candidate Roster
                </h1>
                {/* Search Input *
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
        </div> */}
            <div className="min-h-screen bg-background p-4 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Candidate Roster</h1>
                            <p className="text-muted-foreground">View and manage registered candidates</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* { label: 'Active', value: '256', color: 'text-success' },
                    { label: 'In Pipeline', value: '48', color: 'text-hr-amber' },
                    { label: 'Hired', value: '20', color: 'text-hr-purple' }, */}
                        {[
                            { label: 'Total Candidates', value: candidates.length, color: 'text-primary' },
                        ].map((stat, i) => (
                            <Card key={i} className="border-0 shadow-card">
                                <CardContent className="p-5">
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Search */}
                    <Card className="border-0 shadow-card">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search candidates..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {/* <div className="flex gap-2">
                                <Button variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" />
                                Filter
                                </Button>
                            </div> */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Candidates Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCandidates.map((candidate) => (
                            <Card key={candidate.id} className="border-0 shadow-card card-hover">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hr-purple to-hr-indigo flex items-center justify-center text-primary-foreground text-xl font-bold">
                                            {candidate.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{candidate.name}</h3>
                                            <p className="text-sm text-muted-foreground">{candidate.technology}</p>
                                            {/* <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3.5 h-3.5 text-hr-amber fill-hr-amber" />
                            <span className="text-sm font-medium">{candidate.rating}</span>
                            </div> */}
                                        </div>

                                        {/* Dropdown Menu on dots */}
                                        <DropdownMenu
                                            open={openMenuId === candidate._id}   // or candidate.id
                                            onOpenChange={(open) =>
                                                setOpenMenuId(open ? candidate._id : null)
                                            }
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="end"
                                                className="w-40"
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                            >
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2"
                                                    onClick={() => {
                                                        setOpenMenuId(null);              // close only this menu
                                                        setSelectedCandidate(candidate);  // set candidate
                                                        setOpenProfile(true);             // open dialog
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Profile
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>


                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        {/* <div className="flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="w-4 h-4" />
                                <span>{candidate.experience}</span>
                            </div> */}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{candidate.email}</span>
                                        </div>
                                        {/* <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{candidate.source}</span>
                            </div> */}
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span>{candidate.contact_no}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-1"
                                            onClick={() => {
                                                if (candidate.linkedIn != null) {
                                                    window.open(candidate.linkedIn, "_blank", "noopener,noreferrer");
                                                } else {
                                                    toast({
                                                        variant: "destructive",
                                                        title: "Error",
                                                        description: "LinkedIn profile not available.",
                                                    });
                                                }
                                            }}
                                        >
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn
                                        </Button>

                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => downloadResume(candidate.resume, candidate.name)}
                                            disabled={!candidate.resume?.data}
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            Resume
                                        </Button>

                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                {filteredCandidates.length <= 0 &&
                    <div className="flex items-center justify-center text-gray-500 text-lg">
                        No candidates found.
                    </div>
                }
            </div>

            <Dialog open={openProfile} onOpenChange={setOpenProfile}>
                <DialogContent className="max-w-lg rounded-2xl">
                    {selectedCandidate && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">
                                    Candidate Profile
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hr-purple to-hr-indigo flex items-center justify-center text-primary-foreground text-xl font-bold">
                                        {selectedCandidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{selectedCandidate.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCandidate.technology}
                                        </p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCandidate.email}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCandidate.contact_no}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCandidate.client}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCandidate.source}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-1"
                                        onClick={() => {
                                            if (selectedCandidate.linkedIn != null) {
                                                window.open(selectedCandidate.linkedIn, "_blank");
                                            }
                                            else {
                                                toast({
                                                    variant: "destructive",
                                                    title: "Error",
                                                    description: "LinkedIn profile not available.",
                                                });
                                            }
                                        }}>
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </Button>

                                    <Button
                                        className="flex-1 gap-1"
                                        onClick={() =>
                                            downloadResume(
                                                selectedCandidate.resume,
                                                selectedCandidate.name
                                            )
                                        }
                                        disabled={!selectedCandidate.resume || !selectedCandidate.resume.data}
                                    >
                                        <Download className="w-4 h-4" />
                                        Resume
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CandidatesTable;
