import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../ui/use-toast';
import { userContext } from '../../Context/userContext';
// No longer importing from investmentDeclarationApi
import {
    Send, AlertCircle, CheckCircle, XCircle, Clock, Loader2, PlusCircle
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import Loader from '../Loader/Loader';
import { DEPARTMENT_HIERARCHY } from '../../Constant/constant';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';

// Modular Components
import EmployeeInfoTab from './FormTabs/EmployeeInfoTab';
import ExemptionsTab from './FormTabs/ExemptionsTab';
import DeductionsTab from './FormTabs/DeductionsTab';
import PreviousIncomeTab from './FormTabs/PreviousIncomeTab';
import DeclarationSection from './FormTabs/DeclarationSection';

const InvestmentDeclarationForm = ({ employeeId, financialYear: propFinancialYear, onSuccess, isReadOnly: propReadOnly = false }) => {
    const { user } = useContext(userContext);
    const [declaration, setDeclaration] = useState(null);
    const [currentTab, setCurrentTab] = useState('employee-info');
    const [employees, setEmployees] = useState([]);
    const [selfEmployee, setSelfEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const isReadOnly = propReadOnly || isLocked;

    // Google Drive upload states
    const [uploadingDocs, setUploadingDocs] = useState({
        hraDocuments: false,
        ltaDocuments: false,
        section80CDocuments: false,
        section80CCDDocuments: false,
        section80DDocuments: false,
        housingLoanDocuments: false
    });

    // Form state
    const [formData, setFormData] = useState({
        empId: employeeId || '',
        financialYear: propFinancialYear || '',
        taxScheme: 'Old Tax Scheme',
        employeeName: '',
        employeeCode: '',
        employeeEmail: '',
        department: '',
        designation: '',
        pan: '',
        dob: '',
        gender: '',
        dateOfJoining: '', // Added Date of Joining


        // Exemptions
        exemptions: {
            houseRentAllowance: {
                isApplicable: false,
                rentDetails: {
                    rentPaid: '',
                    months: '',
                    hasRentReceipt: false,
                    landlordPAN: '',
                    rentAgreement: ''
                }
            },
            lta: {
                isApplicable: false,
                claimsDetails: {
                    claims2022: '',
                    claims2023: '',
                    claims2024: '',
                    claims2025: '',
                    claims2026: '',
                    willingToProduceBills: ''
                }
            }
        },

        // Deductions u/s 24
        housingLoanDeductions: [],

        // Section 80C
        section80CDeductions: [],
        section80CTotal: '',

        // Other sections
        section80CCDeduction: { isApplicable: false, amount: '' },
        section80CCD1Deduction: { isApplicable: false, amount: '' },
        section80CCD1BDeduction: { isApplicable: false, amount: '' },
        section80DDeductions: {
            medicalInsuranceIndividual: { isApplicable: false, amount: '', isSenior: false },
            medicalInsuranceParents: { isApplicable: false, amount: '', isSenior: false },
            preventiveHealthCheckup: { isApplicable: false, amount: '' }
        },
        section80EDeduction: { isApplicable: false, amount: '' },
        section80TTADeduction: { isApplicable: false, amount: '' },

        // Previous employment
        previousEmploymentIncome: {
            incomeAfterExemptions: '',
            providentFund: '',
            professionalTax: '',
            tds: ''
        },

        // Income from Other Sources
        incomeFromOtherSources: [
            { description: '', amount: '' }
        ],

        // Other Deductions
        otherDeductions: {
            description: '',
            amount: ''
        },

        // Declaration
        declaration: {
            isAgreed: false,
            agreementText: 'I hereby declare that the information given above is true and correct to the best of my knowledge and belief. I also undertake to inform the company immediately of any change in the information provided above. I understand that any false or misleading information may lead to penalities as per the Income Tax Act, 1961.',
            declaredDate: new Date().toISOString().split('T')[0],
            employeeSignature: ''
        },

        // Document uploads
        hraDocuments: [],
        ltaDocuments: [],
        section80CDocuments: [],
        section80CCDDocuments: [],
        section80DDocuments: [],
        housingLoanDocuments: [],
        declarationDocuments: []
    });

    // Create axios instance for this component
    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true
    });

    // Add interceptor to include Authorization header
    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        const targetEmpId = formData.empId || employeeId;
        // console.log("Checking targetEmpId for fetch:", targetEmpId);
        if (targetEmpId && targetEmpId !== user?._id) {
            fetchExistingDeclaration();
        } else {
            // Reset state if no valid employee is selected
            setDeclaration(null);
            setIsLocked(false);
            setLoading(false);
        }
    }, [formData.empId, formData.financialYear, employeeId, propFinancialYear, user?._id]);

    // Auto-populate form with logged-in user's details for non-accountant/superAdmin roles
    useEffect(() => {
        if (user && user.role && user.role !== 'accountant' && user.role !== 'superAdmin') {
            // Try to find the logged-in user in the fetched employees by matching email
            const emp = employees.find(e => e.email === user.userEmail);
            if (emp) {
                setSelfEmployee(emp);
                setFormData(prev => ({
                    ...prev,
                    empId: emp._id || prev.empId,
                    employeeCode: emp.empId || prev.employeeCode,
                    employeeName: emp.name || prev.employeeName,
                    employeeEmail: emp.email || prev.employeeEmail,
                    department: emp.details?.department || emp.department || prev.department,
                    designation: emp.details?.designation || prev.designation,
                    pan: emp.details?.panNumber || prev.pan,
                    dob: formatDateForInput(emp.details?.dateOfBirth) || prev.dob,
                    gender: normalizeGender(emp.details?.gender) || prev.gender,
                    dateOfJoining: formatDateForInput(emp.details?.dateOfJoining) || prev.dateOfJoining // Auto-populate
                }));
            } else {
                // Remove fallback to user._id as it's not an Employee ID
                setSelfEmployee(null);
            }
        }
    }, [user, employees]);



    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const normalizeGender = (g) => {
        if (!g) return '';
        const lower = g.toLowerCase();
        if (lower === 'male') return 'Male';
        if (lower === 'female') return 'Female';
        if (lower.includes('other')) return 'Other';
        return '';
    };


    const fetchEmployees = async () => {
        setEmployeesLoading(true);
        try {
            const response = await axiosInstance.get('/api/employee/', {
                params: {
                    fields: "_id,name,empId,email,department,details.department,details.dateOfJoining,details.designation,details.panNumber,details.dateOfBirth,details.gender",
                    limit: 500
                },
            });
            if (response.data && response.data.employees) {
                setEmployees(response.data.employees);

                // If employeeId prop is provided, find and set that employee's info
                if (employeeId) {
                    const emp = response.data.employees.find(e => e._id === employeeId || e.empId === employeeId);
                    if (emp) {
                        setFormData(prev => ({
                            ...prev,
                            empId: emp._id,
                            employeeCode: emp.empId || '',
                            employeeName: emp.name || '',
                            employeeEmail: emp.email || '',
                            department: emp.details?.department || emp.department || '',
                            designation: emp.details?.designation || '',
                            pan: emp.details?.panNumber || '',
                            dob: formatDateForInput(emp.details?.dateOfBirth),
                            gender: normalizeGender(emp.details?.gender) || '',
                            dateOfJoining: formatDateForInput(emp.details?.dateOfJoining) || '' // Auto-populate
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast({
                title: 'Error',
                description: 'Failed to load employees',
                variant: 'destructive'
            });
        } finally {
            setEmployeesLoading(false);
        }
    };

    const fetchExistingDeclaration = async () => {
        if (!formData.financialYear) {
            setDeclaration(null);
            setIsLocked(false);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/investmentDeclaration/declaration/employee', {
                params: {
                    employeeId: formData.empId,
                    financialYear: formData.financialYear
                }
            });
            // console.log("Retrieved Data for Form:", response.data.declaration);

            if (response.data.declaration) {
                const decData = response.data.declaration;
                // console.log("Found existing declaration:", decData.status, decData.financialYear);
                setDeclaration(decData);

                // Check if declaration is already submitted or approved to lock the form
                const normalizedStatus = decData.status ? decData.status.toLowerCase() : "";
                const isManagementRole = ['accountant', 'superAdmin'].includes(user?.role);
                const isUserRole = user?.role === 'user';

                // Only lock standard users if the form is submitted/approved. 
                // Management roles (accountant/superAdmin) can still edit unless propReadOnly is true.
                const shouldLock = isUserRole && ['submitted', 'approved'].includes(normalizedStatus);
                setIsLocked(shouldLock);

                // Show "Duplicate" toast only if this was NOT an initial load with props (i.e., user manually changed year/employee)
                const isInitialLoadWithProps = formData.empId === employeeId && formData.financialYear === propFinancialYear;

                if (['submitted', 'approved'].includes(normalizedStatus) && !isInitialLoadWithProps) {
                    // console.log("Triggering toast for manual duplicate/submitted declaration selection");
                    toast({
                        title: 'Duplicate Declaration',
                        description: `A declaration for ${decData.financialYear} has already been ${decData.status.toLowerCase()}. You cannot submit another one.`,
                        variant: 'destructive'
                    });
                }

                setFormData(prev => {
                    // 1. Start with initial/current state
                    let updated = { ...prev };

                    // 2. Unflatten metadata from decData.formData if it exists
                    // This populates flags like isApplicable, hasRentReceipt, etc.
                    if (decData.formData) {
                        updated = { ...updated, ...decData.formData };
                    }

                    // 3. Apply root-level declaration metadata (employee info, financial year, etc.)
                    // and crucially, the populated/grouped documents which are at the root
                    updated = { ...updated, ...decData };

                    // 4. Force specific overrides for complex fields
                    updated.dob = formatDateForInput(decData.dob);
                    updated.dateOfJoining = formatDateForInput(decData.dateOfJoining); // Handle existing data
                    updated.department = decData.department || updated.department || prev.department;
                    updated.empId = decData.employeeId?._id || decData.employeeId || prev.empId;

                    // console.log("Final Form State after Unflattening:", updated);
                    return updated;
                });
            } else {
                // If no declaration found for this year, reset state
                setDeclaration(null);
                setIsLocked(false);
            }
        } catch (error) {
            console.error('Error in fetchExistingDeclaration:', error);
            setIsLocked(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleDeepNestedChange = (section, subsection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }));
    };

    const handleEmployeeSelect = async (empId) => {
        try {
            const employeeData = employees.find(emp => emp.name === empId);
            // Fetch detailed employee information from backend
            // const response = await axios.get(`${API_BASE_URL}/api/employee/${empId}`);

            setFormData(prev => ({
                ...prev,
                empId: employeeData._id,
                employeeCode: employeeData.empId || empId,
                employeeName: employeeData.name || '',
                employeeEmail: employeeData.email || '',
                department: employeeData.details?.department || employeeData.department || '',
                designation: employeeData.details?.designation || '',
                pan: employeeData.details?.panNumber || '',
                dob: formatDateForInput(employeeData.details?.dateOfBirth),
                gender: normalizeGender(employeeData.details?.gender) || '',
                dateOfJoining: formatDateForInput(employeeData.details?.dateOfJoining) || ''
            }));

            // toast({
            //     title: 'Success',
            //     description: 'Employee details loaded successfully'
            // });
        } catch (error) {
            console.error('Error fetching employee details:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch employee details',
                variant: 'destructive'
            });
        }
    };

    const handleDocumentUpload = (documentType, files) => {
        if (files && files.length > 0) {
            const newFiles = Array.from(files).map(file => ({
                name: file.name,
                filename: file.name,
                size: file.size,
                file: file
            }));
            setFormData(prev => ({
                ...prev,
                [documentType]: [...(prev[documentType] || []), ...newFiles]
            }));
        }
    };

    const removeDocument = (documentType, index) => {
        setFormData(prev => ({
            ...prev,
            [documentType]: prev[documentType].filter((_, i) => i !== index)
        }));
    };

    const uploadDocumentToGoogleDrive = async (file, documentType, declarationId) => {
        try {
            if (!declarationId) {
                toast({
                    title: 'Error',
                    description: 'Please save declaration first before uploading documents',
                    variant: 'destructive'
                });
                return null;
            }

            setUploadingDocs(prev => ({
                ...prev,
                [documentType]: true
            }));

            const fd = new FormData();
            fd.append('document', file.file);
            fd.append('section', documentType);

            const response = await axios.post(
                `${API_BASE_URL}/api/investmentDeclaration/declaration/${declarationId}/upload-document`,
                fd,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    withCredentials: true
                }
            );

            if (response.status === 200 || response.status === 201) {
                return response.data.document || null;
            }

            return null;
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to upload document';

            toast({
                title: 'Upload Error',
                description: errorMsg,
                variant: 'destructive'
            });

            return null;
        } finally {
            setUploadingDocs(prev => ({
                ...prev,
                [documentType]: false
            }));
        }
    };


    const handleSection80CAdd = () => {
        setFormData(prev => ({
            ...prev,
            section80CDeductions: [...prev.section80CDeductions, { itemName: 'Life Insurance Premium (LIC)', amount: '' }]
        }));
    };

    const handleSection80CUpdate = (index, field, value) => {
        const updated = [...formData.section80CDeductions];
        updated[index][field] = value;
        setFormData(prev => ({
            ...prev,
            section80CDeductions: updated
        }));
    };

    const handleSection80CRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            section80CDeductions: prev.section80CDeductions.filter((_, i) => i !== index)
        }));
    };

    const handleHousingLoanAdd = () => {
        setFormData(prev => ({
            ...prev,
            housingLoanDeductions: [...prev.housingLoanDeductions, {
                type: 'Post-1999 Self-Occupied',
                amount: '',
                bankersCertificate: '',
                rentalIncome: '',
                maxLimit: 'Rs. 2,00,000/-'
            }]
        }));
    };

    const handleHousingLoanUpdate = (index, field, value) => {
        const updated = [...formData.housingLoanDeductions];
        updated[index][field] = value;

        // Update max limit based on type
        if (field === 'type') {
            if (value === 'Pre-1999 Self-Occupied') updated[index].maxLimit = 'Rs. 30,000/-';
            else if (value === 'Post-1999 Self-Occupied') updated[index].maxLimit = 'Rs. 2,00,000/-';
            else updated[index].maxLimit = 'Actual Interest';
        }

        setFormData(prev => ({
            ...prev,
            housingLoanDeductions: updated
        }));
    };

    const handleHousingLoanRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            housingLoanDeductions: prev.housingLoanDeductions.filter((_, i) => i !== index)
        }));
    };

    const calculateSection80CTotal = () => {
        const section80C = formData.section80CDeductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const section80CCC = parseFloat(formData.section80CCDeduction.amount) || 0;
        const section80CCD1 = parseFloat(formData.section80CCD1Deduction.amount) || 0;

        const aggregateTotal = section80C + section80CCC + section80CCD1;

        setFormData(prev => ({
            ...prev,
            section80CTotal: Math.min(aggregateTotal, 150000)
        }));
    };

    // Recalculate Section 80C total whenever its components change. This avoids timing issues
    // caused by setTimeout-based recalculations and ensures the total stays accurate.
    useEffect(() => {
        const section80C = formData.section80CDeductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const section80CCC = parseFloat(formData.section80CCDeduction.amount) || 0;
        const section80CCD1 = parseFloat(formData.section80CCD1Deduction.amount) || 0;

        const aggregateTotal = section80C + section80CCC + section80CCD1;

        setFormData(prev => ({
            ...prev,
            section80CTotal: Math.min(aggregateTotal, 150000)
        }));
    }, [formData.section80CDeductions, formData.section80CCDeduction.amount, formData.section80CCD1Deduction.amount]);

    const handleSaveDraft = async () => {
        setSubmitting(true);
        try {
            console.log("EMPLOYEE ID for Save Draft:", formData.empId, employeeId);
            const selectedEmployeeId = formData.empId || employeeId;

            if (!selectedEmployeeId) {
                toast({
                    title: 'Error',
                    description: 'Please select an employee first',
                    variant: 'destructive'
                });
                setSubmitting(false);
                return;
            }

            const { empId, employeeCode, ...restFormData } = formData;

            await axiosInstance.post('/api/investmentDeclaration/declaration', {
                employeeId: selectedEmployeeId,
                ...restFormData,
                status: 'Draft'
            });
            toast({
                title: 'Success',
                description: 'Declaration saved as draft'
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save declaration';
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };


    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

    const handleConfirmSubmit = async () => {
        setIsConfirmSubmitOpen(false);
        setSubmitting(true);
        try {
            // console.log("Form Data on Submit:", formData);
            const selectedEmployeeId = formData.empId;
            // First save the data
            // console.log("Submitting Declaration for Employee ID:", selectedEmployeeId);
            const saveResponse = await axiosInstance.post('/api/investmentDeclaration/declaration', {
                employeeId: selectedEmployeeId,
                ...formData,
                status: 'Submitted'
            });

            const declarationId = saveResponse.data.declaration._id;

            // Then submit
            const submitResponse = await axiosInstance.post('/api/investmentDeclaration/declaration/submit', {
                declarationId,
                employeeId: selectedEmployeeId
            });

            // Update declaration state with new data
            const newDeclaration = submitResponse.data.declaration || saveResponse.data.declaration;
            setDeclaration(newDeclaration);

            // After successful submit, upload all local documents for this declaration
            const sections = ['hraDocuments', 'ltaDocuments', 'section80CDocuments', 'section80CCDDocuments', 'section80DDocuments', 'housingLoanDocuments', 'declarationDocuments'];

            for (const section of sections) {
                const files = (formData[section] || []).filter(f => f && f.file);
                for (const f of files) {
                    const doc = await uploadDocumentToGoogleDrive(f, section, declarationId);
                    if (doc) {
                        // Append locally so user sees immediately
                        setDeclaration(prev => ({
                            ...prev,
                            documents: [...(prev.documents || []), doc]
                        }));
                    }
                }
            }

            toast({
                title: 'Success',
                variant: 'success',
                description: 'Declaration submitted successfully'
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit declaration';
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.declaration.isAgreed) {
            toast({
                title: 'Declaration Required',
                description: 'Please agree to the declaration and sign before submitting',
                variant: 'destructive'
            });
            return;
        }

        if (!formData.declaration.employeeSignature) {
            toast({
                title: 'Signature Required',
                description: 'Please type your full name as signature',
                variant: 'destructive'
            });
            return;
        }

        setIsConfirmSubmitOpen(true);
    };

    const handleStatusUpdate = async (newStatus, reason = '') => {
        if (!declaration?._id) return;

        setSubmitting(true);
        try {
            const response = await axiosInstance.put('/api/investmentDeclaration/declaration/status', {
                declarationId: declaration._id,
                status: newStatus,
                rejectionReason: reason
            });

            setDeclaration(response.data.declaration);
            toast({
                title: 'Success',
                description: `Declaration ${newStatus.toLowerCase()} successfully`,
                variant: 'success'
            });

            if (onSuccess) onSuccess();
            setIsRejectDialogOpen(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'Failed to update status',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) {
        return <Loader />
    }

    return (
        <div className="w-full space-y-6">
            {/* Info Banner for New Declaration */}
            {!declaration && (
                <Card className='border-0 bg-primary/5 border-primary/20'>
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Create New Declaration</p>
                                <p className="text-sm text-muted-foreground mt-1">Fill in all sections carefully. You can save as draft and return later. Submit when complete for admin approval.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            )}

            {/* Status Banner - Redesigned with distinct contrast */}
            {formData.financialYear && (
                (() => {
                    const status = declaration?.status || 'New';
                    const configs = {
                        Approved: {
                            bg: 'bg-green-50',
                            border: 'border-green-200',
                            text: 'text-green-900',
                            iconColor: 'text-green-600',
                            icon: CheckCircle,
                            desc: 'Your investment declaration has been approved by the admin.'
                        },
                        Submitted: {
                            bg: 'bg-blue-50', // Changed to Blue for better distinction
                            border: 'border-blue-200',
                            text: 'text-blue-900',
                            iconColor: 'text-blue-600',
                            icon: Clock,
                            desc: 'Your declaration has been submitted successfully. Awaiting admin approval.'
                        },
                        Rejected: {
                            bg: 'bg-red-50',
                            border: 'border-red-200',
                            text: 'text-red-900',
                            iconColor: 'text-red-600',
                            icon: XCircle,
                            desc: 'Your declaration was rejected. Please review the remarks and resubmit.'
                        },
                        Draft: {
                            bg: 'bg-amber-50',
                            border: 'border-amber-200',
                            text: 'text-amber-900',
                            iconColor: 'text-amber-600',
                            icon: Clock,
                            desc: 'Your form is saved as draft. You can continue editing and submit when ready.'
                        },
                        New: {
                            bg: 'bg-slate-50', // Gray for empty state
                            border: 'border-slate-200',
                            text: 'text-slate-900',
                            iconColor: 'text-slate-600',
                            icon: PlusCircle,
                            desc: `No declaration found for ${formData.financialYear}. You can start a new submission.`
                        }
                    };

                    const config = configs[status] || configs.draft;
                    const Icon = config.icon;

                    return (
                        <div className={`rounded-lg border shadow-sm overflow-hidden ${config.bg} ${config.border}`}>
                            <div className="p-5 flex items-start gap-4">
                                <div className={`pt-0.5 flex-shrink-0 ${config.iconColor}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-lg ${config.text}`}>
                                        Declaration Status: {status === 'new' ? 'New' : (declaration?.status || 'New')}
                                    </h3>
                                    <p className={`text-sm mt-1 opacity-90 ${config.text}`}>
                                        {config.desc}
                                    </p>

                                    {declaration?.rejectionReason && status === 'rejected' && (
                                        <div className="mt-3 p-3 rounded border-l-4 bg-red-100 border-red-400 text-red-900">
                                            <p className="text-xs font-semibold">Rejection Reason:</p>
                                            <p className="text-sm mt-1">{declaration.rejectionReason}</p>
                                        </div>
                                    )}

                                    {declaration && (
                                        <div className="flex flex-wrap gap-4 text-xs mt-3 opacity-70">
                                            {declaration.submittedDate && (
                                                <span className="text-gray-600 font-medium">
                                                    Submitted: {new Date(declaration.submittedDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {declaration.approvalDate && (
                                                <span className="text-gray-600 font-medium">
                                                    Reviewed: {new Date(declaration.approvalDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}


            {/* Form Tabs */}
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="flex flex-wrap sm:grid w-full sm:grid-cols-4 gap-2 bg-slate-100 p-1 h-auto sm:h-10">
                    <TabsTrigger value="employee-info" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2">Employee Info</TabsTrigger>
                    <TabsTrigger value="exemptions" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2">Exemptions</TabsTrigger>
                    <TabsTrigger value="deductions" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2">Deductions</TabsTrigger>
                    <TabsTrigger value="previous-income" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2">Previous Income</TabsTrigger>
                </TabsList>

                {/* Employee Information Tab */}
                <TabsContent value="employee-info">
                    <EmployeeInfoTab
                        formData={formData}
                        isReadOnly={isReadOnly}
                        propReadOnly={propReadOnly}
                        user={user}
                        employees={employees}
                        employeesLoading={employeesLoading}
                        handleInputChange={handleInputChange}
                        handleEmployeeSelect={handleEmployeeSelect}
                        normalizeGender={normalizeGender}
                        selfEmployee={selfEmployee}
                    />
                </TabsContent>

                {/* Exemptions Tab */}
                <TabsContent value="exemptions">
                    <ExemptionsTab
                        formData={formData}
                        isReadOnly={isReadOnly}
                        handleDeepNestedChange={handleDeepNestedChange}
                        handleDocumentUpload={handleDocumentUpload}
                        removeDocument={removeDocument}
                        declaration={declaration}
                    />
                </TabsContent>

                {/* Deductions Tab */}
                <TabsContent value="deductions">
                    <DeductionsTab
                        formData={formData}
                        isReadOnly={isReadOnly}
                        handleHousingLoanAdd={handleHousingLoanAdd}
                        handleHousingLoanUpdate={handleHousingLoanUpdate}
                        handleHousingLoanRemove={handleHousingLoanRemove}
                        handleSection80CAdd={handleSection80CAdd}
                        handleSection80CUpdate={handleSection80CUpdate}
                        handleSection80CRemove={handleSection80CRemove}
                        handleDocumentUpload={handleDocumentUpload}
                        removeDocument={removeDocument}
                        declaration={declaration}
                        setFormData={setFormData}
                    />
                </TabsContent>

                {/* Previous Income Tab */}
                <TabsContent value="previous-income">
                    <PreviousIncomeTab
                        formData={formData}
                        isReadOnly={isReadOnly}
                        handleNestedChange={handleNestedChange}
                        handleInputChange={handleInputChange}
                    />
                </TabsContent>
            </Tabs>

            <DeclarationSection
                formData={formData}
                isReadOnly={isReadOnly}
                setFormData={setFormData}
                handleDocumentUpload={handleDocumentUpload}
                removeDocument={removeDocument}
                declaration={declaration}
            />


            {/* Action Buttons */}
            {!isReadOnly && (
                <div className="flex gap-3 justify-end">
                    {/* <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={submitting}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save as Draft
                    </Button> */}
                    <Dialog open={isConfirmSubmitOpen} onOpenChange={setIsConfirmSubmitOpen}>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {submitting ? 'Submitting...' : declaration ? 'Edit Declaration' : 'Submit Declaration'}
                        </Button>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogTitle>Confirm Submission</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to {declaration ? 'update' : 'submit'} your investment declaration? Once submitted, it will be sent for review and further modifications may require admin intervention.
                            </DialogDescription>
                            <DialogFooter className="mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsConfirmSubmitOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmSubmit}
                                    disabled={submitting}
                                    className="gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Confirm & Submit
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            {isReadOnly && (user?.role === 'accountant' || user?.role === 'superAdmin') && declaration?.status?.toLowerCase() === 'submitted' && (
                <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-slate-200">
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject Declaration
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            {/* <DialogHeader> */}
                            <DialogTitle>Rejection Reason</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this declaration. This will be visible to the employee.
                            </DialogDescription>
                            {/* </DialogHeader> */}
                            <div className="py-4">
                                <Textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRejectDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate('Rejected', rejectionReason)}
                                    disabled={submitting || !rejectionReason.trim()}
                                >
                                    {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={() => handleStatusUpdate('Approved')}
                        disabled={submitting}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Approve Declaration
                    </Button>
                </div>
            )}
        </div>
    );
};

export default InvestmentDeclarationForm;
