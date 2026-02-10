import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
    Search,
    Filter,
    FileText,
    Eye,
    Trash2,
    Edit,
    Download,
    ExternalLink,
    Plus,
    User,
    Calendar,
    ChevronDown,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    FileCheck,
    FileQuestion,
    Paperclip,
    DownloadIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Components/ui/select';
import { Badge } from '../Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogTrigger
} from "../Components/ui/dialog";
import { userContext } from '../Context/userContext';
// No longer importing from investmentDeclarationApi
import axios from 'axios';
import API_BASE_URL from '../config';
import { useToast } from '../Components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

import InvestmentDeclarationForm from '../Components/InvestmentDeclaration/InvestmentDeclarationForm';
import { downloadForm12BB } from '../templates/InvestmentDeclarationPDFTemplate';




const InvestmentDeclarationTracker = () => {
    const { user } = useContext(userContext);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [declarations, setDeclarations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [declarationToDelete, setDeclarationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [declarationToEdit, setDeclarationToEdit] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [declarationToView, setDeclarationToView] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, [user]);

    useEffect(() => {
        fetchDeclarations();
    }, [user, selectedYear, selectedStatus]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/employee/`, {
                params: {
                    fields: "_id,name,empId,email,department",
                    limit: 500
                },
            });
            if (response.data && response.data.employees) {
                setEmployees(response.data.employees);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Create axios instance for this component with interception for token
    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: API_BASE_URL,
            withCredentials: true
        });
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        return instance;
    }, []);

    const fetchDeclarations = async () => {
        setLoading(true);
        try {
            const filters = {
                limit: 200
            };
            if (selectedYear !== 'all') filters.financialYear = selectedYear;
            if (selectedStatus !== 'all') filters.status = selectedStatus;

            const response = await axiosInstance.get('/api/investmentDeclaration/declarations/all', {
                params: filters
            });
            setDeclarations(response.data.declarations || []);
        } catch (error) {
            console.error('Error fetching declarations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load declarations',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchDeclarations();
    };


    const handleDownloadPDF = async (declaration) => {
        await downloadForm12BB(declaration);
    };

    const handleDeleteClick = (declaration) => {
        setDeclarationToDelete(declaration);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!declarationToDelete) return;
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/api/investmentDeclaration/declaration/${declarationToDelete._id}`);
            toast({
                title: 'Success',
                description: 'Declaration deleted successfully',
                variant: 'success'
            });
            setDeclarations(prev => prev.filter(d => d._id !== declarationToDelete._id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting declaration:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'Failed to delete declaration',
                variant: 'destructive'
            });
        } finally {
            setIsDeleting(false);
            setDeclarationToDelete(null);
        }
    };

    const handleEdit = (declaration) => {
        setDeclarationToEdit(declaration);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setDeclarationToEdit(null);
        fetchDeclarations();
        toast({
            title: 'Success',
            description: 'Declaration updated successfully',
            variant: 'success'
        });
    };

    const handleView = (declaration) => {
        setDeclarationToView(declaration);
        setIsViewModalOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'Rejected':
                return <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            case 'Submitted':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>;
            case 'Draft':
                return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredDeclarations = useMemo(() => {
        return declarations.filter(dec => {
            const matchesSearch =
                (dec.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dec.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dec.employeeEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

            // Handle cases where employeeId might be an object or just a string ID
            const empId = dec.employeeId?._id || dec.employeeId;
            const matchesEmployee = selectedEmployee === 'all' || empId === selectedEmployee;
            const matchesStatus = selectedStatus === 'all' || dec.status === selectedStatus;

            return matchesSearch && matchesEmployee && matchesStatus;
        });
    }, [declarations, searchTerm, selectedEmployee, selectedStatus]);

    const stats = useMemo(() => {
        return {
            total: declarations.length,
            approved: declarations.filter(d => d.status === 'Approved').length,
            pending: declarations.filter(d => d.status === 'Submitted').length,
            draft: declarations.filter(d => d.status === 'Rejected').length,
        };
    }, [declarations]);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {user?.role === 'user' ? 'My Investment Declarations' : 'Investment Tracker'}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                {user?.role === 'user' ? 'View and track your tax declarations' : 'Manage and review employee tax declarations'}
                            </p>
                        </div>
                    </div>
                    {user?.role !== 'user' && (
                        <Button
                            onClick={() => navigate('/investment-declaration')}
                            className="bg-primary hover:bg-primary/90 shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Declaration
                        </Button>
                    )}
                </div>

                {/* Stats Grid */}
                {user?.role !== 'user' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Declarations', value: stats.total, color: 'text-primary', icon: FileText, bg: 'bg-primary/10' },
                            { label: 'Approved', value: stats.approved, color: 'text-green-600', icon: CheckCircle, bg: 'bg-green-100' },
                            { label: 'Review Pending', value: stats.pending, color: 'text-blue-600', icon: Clock, bg: 'bg-blue-100' },
                            { label: 'Rejected', value: stats.draft, color: 'text-red-600', icon: XCircle, bg: 'bg-red-100' },
                        ].map((stat, i) => (
                            <Card key={i} className="border-0 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <Card className="border-slate-200/60 shadow-sm backdrop-blur-sm bg-white/80">
                    <CardContent className="p-4 md:p-6">
                        <div className={`grid grid-cols-1 ${user?.role === 'user' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-2'} gap-4`}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search name, code, email..."
                                    className="pl-10 border-slate-200 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className='flex gap-2'>
                                {user?.role !== 'user' && (
                                    <div className='relative w-full'>
                                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                            <SelectTrigger className="border-slate-200">
                                                <SelectValue placeholder="All Employees" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Employees</SelectItem>
                                                {employees.map(emp => (
                                                    <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                                    </div>
                                )}
                                <div className='relative w-full'>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="border-slate-200">
                                            <SelectValue placeholder="Financial Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Select Year</SelectItem>
                                            <SelectItem value="2023-24">2023-24</SelectItem>
                                            <SelectItem value="2024-25">2024-25</SelectItem>
                                            <SelectItem value="2025-26">2025-26</SelectItem>
                                            <SelectItem value="2026-27">2026-27</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* Main Table */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-200/60 py-4 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-slate-800">Declarations List</CardTitle>
                            <Badge variant="outline" className="text-slate-500 font-normal">
                                Showing {filteredDeclarations.length} items
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200/60">
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4 text-center">Year</th>
                                        <th className="px-6 py-4 text-center">Scheme</th>
                                        <th className="px-6 py-4 text-center">Documents</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                                                    <p className="text-slate-500 font-medium">Loading declarations...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredDeclarations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-24 text-center">
                                                <div className="max-w-xs mx-auto space-y-3">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                                        <FileQuestion className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-slate-900 font-semibold">No declarations found</h3>
                                                    <p className="text-slate-500 text-xs">Try adjusting your filters or search terms to find what you're looking for.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDeclarations.map((dec) => (
                                            <tr key={dec._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                                            {dec.employeeName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{dec.employeeName}</div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">{dec.employeeCode}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                <span>{dec.employeeEmail}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="secondary" className="font-mono font-medium text-xs tracking-tight">
                                                        {dec.financialYear}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${dec.taxScheme === 'New Tax Scheme'
                                                        ? 'bg-purple-50 text-purple-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {dec.taxScheme === 'New Tax Scheme' ? 'New' : 'Old'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="grid grid-cols-2 gap-1 justify-items-center min-w-[140px]">
                                                        {/* Document counts */}
                                                        {[
                                                            { label: 'HRA', count: dec.hraDocuments?.length || 0, docs: dec.hraDocuments },
                                                            { label: 'LTA', count: dec.ltaDocuments?.length || 0, docs: dec.ltaDocuments },
                                                            { label: '80C', count: dec.section80CDocuments?.length || 0, docs: dec.section80CDocuments },
                                                            { label: 'CCD', count: dec.section80CCDDocuments?.length || 0, docs: dec.section80CCDDocuments },
                                                            { label: '80D', count: dec.section80DDocuments?.length || 0, docs: dec.section80DDocuments },
                                                            { label: 'Home', count: dec.housingLoanDocuments?.length || 0, docs: dec.housingLoanDocuments },
                                                            { label: 'Dec', count: dec.declarationDocuments?.length || 0, docs: dec.declarationDocuments },
                                                            { label: 'Other', count: dec.otherDocuments?.length || 0, docs: dec.otherDocuments }
                                                        ].filter(item => item.count > 0).map((item, idx) => (
                                                            <Dialog key={idx}>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-7 w-full px-2 text-[10px] font-semibold border border-slate-200 flex items-center justify-between rounded-md transition-all duration-200 hover:bg-primary/10 hover:border-primary">
                                                                        <span className="truncate text-slate-700 hover:text-primary">{item.label}</span>
                                                                        <span className="ml-1 px-1 py-0.5 min-w-[22px] rounded-full bg-slate-100 text-primary text-[9px] font-bold text-center transition">
                                                                            {item.count}
                                                                        </span>
                                                                    </Button>

                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-md">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="flex items-center gap-2">
                                                                            <Paperclip className="w-4 h-4" />
                                                                            {item.label === 'Dec' ? 'Declaration' : item.label === 'Home' ? 'Home Loan' : item.label} Documents
                                                                        </DialogTitle>
                                                                        <DialogDescription>
                                                                            Uploaded documents for {dec.employeeName}
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-2 mt-4">
                                                                        {item.docs.map((doc, docIdx) => (
                                                                            <div key={docIdx} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="p-2 bg-white rounded border shadow-sm">
                                                                                        <FileCheck className="w-4 h-4 text-primary" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-sm font-medium truncate max-w-[200px]">{doc.filename}</div>
                                                                                        <div className="text-[10px] text-slate-500">{new Date(doc.uploadDate || doc.uploadedAt).toLocaleDateString()}</div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="ghost"
                                                                                        className="h-8 w-8 text-primary"
                                                                                        title="Preview"
                                                                                        onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, '_blank')}
                                                                                    >
                                                                                        <Eye className="w-4 h-4" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="ghost"
                                                                                        className="h-8 w-8 text-slate-500"
                                                                                        title="Download"
                                                                                        onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, '_blank')}
                                                                                    >
                                                                                        <Download className="w-4 h-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ))}
                                                        {(!dec.hraDocuments?.length &&
                                                            !dec.ltaDocuments?.length &&
                                                            !dec.section80CDocuments?.length &&
                                                            !dec.section80CCDDocuments?.length &&
                                                            !dec.section80DDocuments?.length &&
                                                            !dec.housingLoanDocuments?.length &&
                                                            !dec.declarationDocuments?.length &&
                                                            !dec.otherDocuments?.length) && (
                                                                <div className="col-span-2">
                                                                    <span className="text-slate-400 text-[10px] italic">No docs</span>
                                                                </div>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(dec.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 transition-opacity">
                                                        {/* 1. VIEW BUTTON - Always visible */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleView(dec)}
                                                            title="View Declaration"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>

                                                        {/* 2. PDF DOWNLOAD BUTTON */}
                                                        {/* Visible if User and Approved, OR if Admin/Accountant (always) */}
                                                        {((user?.role === 'user' && dec.status === 'Approved') ||
                                                            (user?.role !== 'user')
                                                        ) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50"
                                                                    onClick={() => handleDownloadPDF(dec)}
                                                                    title="Download Form 12BB"
                                                                >
                                                                    <DownloadIcon className="w-4 h-4" />
                                                                </Button>
                                                            )}

                                                        {/* 3. EDIT BUTTON */}
                                                        {/* User: Draft or Rejected only. Admin: All (except maybe Approved/Submitted locks? Keeping pure logic for now) */}
                                                        {/* Assuming Admin can edit anytime, but usually Approved should be locked.
                                                            Required Condition: User -> Rejected/Draft.
                                                            Let's enable for Admin/Accountant always for flexibility, or follow same logic?
                                                            Plan said: "Accountant: Keep existing actions". "User: Edit only if Rejected/Draft".
                                                        */}
                                                        {(
                                                            (user?.role !== 'user') || // Admin/Accountant can edit
                                                            (user?.role === 'user' && ['Draft', 'Rejected'].includes(dec.status)) // User can edit only Draft/Rejected
                                                        ) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                                                                    onClick={() => handleEdit(dec)}
                                                                    title="Edit Declaration"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            )}

                                                        {/* 4. DELETE BUTTON - Admin/Accountant Only */}
                                                        {user?.role !== 'user' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDeleteClick(dec)}
                                                                title="Delete Declaration"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card >
            </div >

            {/* Delete Confirmation Modal */}
            < Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete the investment declaration for <b>{declarationToDelete?.employeeName}</b> for FY <b>{declarationToDelete?.financialYear}</b>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-xs text-red-700 mt-4">
                        This action cannot be undone. All documents and data associated with this declaration will be permanently removed.
                    </div>
                    <DialogFooter className="mt-6 gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="shadow-sm"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Declaration'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
            {/* Edit Declaration Modal */}
            < Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen} >
                <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Edit className="w-6 h-6 text-primary" />
                            Edit Investment Declaration
                        </DialogTitle>
                        <DialogDescription>
                            Review and update the tax declaration for <b>{declarationToEdit?.employeeName}</b>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        {declarationToEdit && (
                            <InvestmentDeclarationForm
                                employeeId={declarationToEdit.employeeId._id || declarationToEdit.employeeId}
                                financialYear={declarationToEdit.financialYear}
                                onSuccess={handleEditSuccess}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog >

            {/* View Declaration Modal */}
            < Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen} >
                <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Eye className="w-6 h-6 text-blue-600" />
                            View Investment Declaration
                        </DialogTitle>
                        <DialogDescription>
                            Viewing details for <b>{declarationToView?.employeeName}</b>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        {declarationToView && (
                            <InvestmentDeclarationForm
                                employeeId={declarationToView.employeeId._id || declarationToView.employeeId}
                                financialYear={declarationToView.financialYear}
                                isReadOnly={true}
                                onSuccess={fetchDeclarations}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog >
        </div >
    );
};

export default InvestmentDeclarationTracker;
