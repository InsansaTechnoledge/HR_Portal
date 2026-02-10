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
    ChevronDown, Paperclip, Save, Send, AlertCircle, CheckCircle, XCircle, Clock,
    Upload, X, User, FileText, FileImage, Loader2, Cloud, CloudOff, Eye, Download,
    Trash2, Plus, Info, Calendar, Briefcase, Mail, Phone, Hash, CreditCard,
    PieChart, Wallet, Trophy, PlusCircle, MinusCircle, ChevronUp, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import Loader from '../Loader/Loader';
import { DEPARTMENT_HIERARCHY } from '../../Constant/constant';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';

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
            const emp = employees.find(e => e.email && user.userEmail && e.email.toLowerCase() === user.userEmail.toLowerCase());
            if (emp) {
                setSelfEmployee(emp);
                setFormData(prev => ({
                    ...prev,
                    empId: emp._id || prev.empId,
                    employeeCode: emp.empId || prev.employeeCode,
                    employeeName: emp.name || prev.employeeName,
                    employeeEmail: emp.email || prev.employeeEmail,
                    department: emp.department || prev.department,
                    designation: emp.details?.designation || prev.designation,
                    pan: emp.details?.panNumber || prev.pan,
                    dob: formatDateForInput(emp.details?.dateOfBirth) || prev.dob,
                    gender: emp.details?.gender || prev.gender,
                    dateOfJoining: formatDateForInput(emp.dateOfJoining) || prev.dateOfJoining // Auto-populate
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


    const fetchEmployees = async () => {
        setEmployeesLoading(true);
        try {
            const response = await axiosInstance.get('/api/employee/', {
                params: {
                    fields: "_id,name,empId,email,department,dateOfJoining,details.designation,details.panNumber,details.dateOfBirth,details.gender",
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
                            department: emp.department || '',
                            designation: emp.details?.designation || '',
                            pan: emp.details?.panNumber || '',
                            dob: formatDateForInput(emp.details?.dateOfBirth),
                            gender: emp.details?.gender || '',
                            dateOfJoining: formatDateForInput(emp.dateOfJoining) || '' // Auto-populate
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
                department: employeeData.department || '',
                designation: employeeData.details?.designation || '',
                pan: employeeData.details?.panNumber || '',
                dob: formatDateForInput(employeeData.details?.dateOfBirth),
                gender: employeeData.details?.gender || '',
                dateOfJoining: formatDateForInput(employeeData.dateOfJoining) || ''
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

    const isDetailsEmpty = () => {
        // 1. Check HRA
        if (formData.exemptions.houseRentAllowance.rentDetails.rentPaid) return false;

        // 2. Check LTA
        const ltaClaims = formData.exemptions.lta.claimsDetails;
        if (Object.values(ltaClaims).some(val => val && val !== '')) return false;

        // 3. Check Housing Loan Deductions
        if (formData.housingLoanDeductions.some(d => d.amount && d.amount !== '')) return false;

        // 4. Check Section 80C
        if (formData.section80CDeductions.some(d => d.amount && d.amount !== '')) return false;

        // 5. Check Other Sections
        const otherSections = [
            formData.section80CCDeduction.amount,
            formData.section80CCD1Deduction.amount,
            formData.section80CCD1BDeduction.amount,
            formData.section80DDeductions.medicalInsuranceIndividual.amount,
            formData.section80DDeductions.medicalInsuranceParents.amount,
            formData.section80DDeductions.preventiveHealthCheckup.amount,
            formData.section80EDeduction.amount,
            formData.section80TTADeduction.amount,
            formData.previousEmploymentIncome.incomeAfterExemptions,
            formData.otherDeductions.amount
        ];
        if (otherSections.some(val => val && val !== '')) return false;

        // 6. Check Income from Other Sources
        if (formData.incomeFromOtherSources.some(item => item.amount && item.amount !== '')) return false;

        return true;
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

        if (isDetailsEmpty()) {
            toast({
                title: 'Incomplete Declaration',
                description: 'Please fill in at least one investment or income detail before submitting.',
                variant: 'destructive'
            });
            return;
        }

        setSubmitting(true);
        try {
            console.log("Form Data on Submit:", formData);
            const selectedEmployeeId = formData.empId;
            // First save the data
            console.log("Submitting Declaration for Employee ID:", selectedEmployeeId);
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
            // const declarationId = newDeclaration._id;
            const sections = ['hraDocuments', 'ltaDocuments', 'section80CDocuments', 'section80CCDDocuments', 'section80DDocuments', 'housingLoanDocuments', 'declarationDocuments'];
            const uploadedDocs = [];

            for (const section of sections) {
                const files = (formData[section] || []).filter(f => f && f.file);
                for (const f of files) {
                    const doc = await uploadDocumentToGoogleDrive(f, section, declarationId);
                    if (doc) {
                        uploadedDocs.push(doc);
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

    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

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
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Financial Year + Employee Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Financial Year Selection */}
                                <div className="">
                                    <div>
                                        <label className="block text-sm text-card-foreground font-semibold mb-2">
                                            Select Financial Year
                                        </label>
                                        <div className='relative'>
                                            <Select disabled={propReadOnly}
                                                value={formData.financialYear}
                                                onValueChange={(value) =>
                                                    handleInputChange("financialYear", value)
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select financial year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="2023-24">2023-24</SelectItem>
                                                    <SelectItem value="2024-25">2024-25</SelectItem>
                                                    <SelectItem value="2025-26">2025-26</SelectItem>
                                                    <SelectItem value="2026-27">2026-27</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                        </div>

                                    </div>
                                </div>

                                {(user && (user.role === 'accountant' || user.role === 'superAdmin')) ? (
                                    <div>
                                        {/* Employee Selection (accountant / superAdmin only) */}
                                        <label className="block text-sm text-card-foreground font-semibold mb-2">
                                            Select Employee
                                        </label>
                                        <div className='relative'>
                                            <Select disabled={propReadOnly}
                                                value={formData.employeeName || ""}
                                                onValueChange={handleEmployeeSelect}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            employeesLoading
                                                                ? "Loading employees..."
                                                                : "Select an employee"
                                                        }
                                                    />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.empId} value={emp.name}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <User className="w-4 h-4 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{emp.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {emp.empId} • {emp.department}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                        </div>


                                        <p className="text-xs text-muted-foreground mt-2">
                                            Select an employee to auto-populate the details below.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm text-card-foreground font-semibold mb-2">Employee</label>
                                        <div className="p-2 rounded-md border bg-white">
                                            <p className="font-medium">
                                                {selfEmployee?.name || user?.userName}
                                                <span className="text-xs text-muted-foreground"> • {selfEmployee?.department || user?.department}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 pl-1">You are filling this form for yourself. Details have been auto-populated.</p>
                                    </div>
                                )}
                            </div>


                            {/* Tax Scheme Selection */}
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <label className="block text-sm text-card-foreground font-semibold mb-2">Select Tax Scheme for FY {formData.financialYear}</label>
                                <div className="relative">
                                    <Select disabled={isReadOnly} value={formData.taxScheme} onValueChange={(value) => handleInputChange('taxScheme', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Old Tax Scheme">Old Tax Scheme (With Deductions)</SelectItem>
                                            <SelectItem value="New Tax Scheme">New Tax Scheme (Without Deductions)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                </div>

                                <p className="text-xs text-muted-foreground mt-2">
                                    Note: All tax reliefs and deductions are available only under the Old Tax Scheme.
                                </p>
                            </div>

                            {/* Employee Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold">Employee ID</label>
                                    <Input disabled={isReadOnly}
                                        value={formData.empId}
                                        // disabled
                                        placeholder="Employee ID (Auto-filled)"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Employee Name</label>
                                    <Input disabled={isReadOnly}
                                        value={formData.employeeName}
                                        onChange={(e) => handleInputChange('employeeName', e.target.value)}
                                        placeholder="Full Name"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Designation</label>
                                    <Input disabled={isReadOnly}
                                        value={formData.designation}
                                        onChange={(e) => handleInputChange('designation', e.target.value)}
                                        placeholder="Designation"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">PAN</label>
                                    <Input disabled={isReadOnly}
                                        value={formData.pan}
                                        onChange={(e) => handleInputChange('pan', e.target.value)}
                                        placeholder="PAN Number"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Date of Joining</label>
                                    <Input disabled={isReadOnly}
                                        type="date"
                                        value={formData.dateOfJoining}
                                        onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Date of Birth</label>
                                    <Input disabled={isReadOnly}
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleInputChange('dob', e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Gender</label>
                                    <div className='relative'>
                                        <Select disabled={isReadOnly} value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                            <SelectTrigger className="mt-2">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                    </div>


                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Exemptions Tab */}
                <TabsContent value="exemptions">
                    <div className="space-y-4">
                        {/* House Rent Allowance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Exemption u/s 10 - House Rent Allowance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox disabled={isReadOnly}
                                        checked={formData.exemptions.houseRentAllowance.isApplicable}
                                        onCheckedChange={(checked) =>
                                            handleDeepNestedChange('exemptions', 'houseRentAllowance', 'isApplicable', checked)
                                        }
                                    />
                                    <label className="text-sm font-medium">Claim HRA Exemption</label>
                                </div>

                                {formData.exemptions.houseRentAllowance.isApplicable && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                                        <div>
                                            <label className="text-sm font-semibold">Rent Paid (Rs.)</label>
                                            <Input disabled={isReadOnly}
                                                type="number"
                                                value={formData.exemptions.houseRentAllowance.rentDetails.rentPaid}
                                                onChange={(e) =>
                                                    handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                                        ...formData.exemptions.houseRentAllowance.rentDetails,
                                                        rentPaid: e.target.value
                                                    })
                                                }
                                                placeholder="Enter rent amount"
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold">Number of Months</label>
                                            <Input disabled={isReadOnly}
                                                type="number"
                                                value={formData.exemptions.houseRentAllowance.rentDetails.months}
                                                onChange={(e) =>
                                                    handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                                        ...formData.exemptions.houseRentAllowance.rentDetails,
                                                        months: e.target.value
                                                    })
                                                }
                                                placeholder="Number of months"
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold">Landlord PAN</label>
                                            <Input disabled={isReadOnly}
                                                value={formData.exemptions.houseRentAllowance.rentDetails.landlordPAN}
                                                onChange={(e) =>
                                                    handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                                        ...formData.exemptions.houseRentAllowance.rentDetails,
                                                        landlordPAN: e.target.value
                                                    })
                                                }
                                                placeholder="PAN of Landlord (if rent > 1 lac)"
                                                className="mt-2"
                                            />
                                        </div>
                                        <div></div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox disabled={isReadOnly}
                                                checked={formData.exemptions.houseRentAllowance.rentDetails.hasRentReceipt}
                                                onCheckedChange={(checked) =>
                                                    handleDeepNestedChange('exemptions', 'houseRentAllowance', 'rentDetails', {
                                                        ...formData.exemptions.houseRentAllowance.rentDetails,
                                                        hasRentReceipt: checked
                                                    })
                                                }
                                            />
                                            <label className="text-sm font-medium">I have rent receipts/agreement</label>
                                        </div>

                                        {formData.exemptions.houseRentAllowance.rentDetails.hasRentReceipt && (
                                            <div className="border-t pt-4 mt-4">
                                                <label className="block text-sm font-semibold mb-3">Upload HRA Receipts & Agreements</label>
                                                {!isReadOnly && (
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/20 transition">
                                                            <Upload className="w-4 h-4" />
                                                            <span className="text-sm">Choose Files</span>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                onChange={(e) => handleDocumentUpload('hraDocuments', e.target.files)}
                                                                className="hidden"
                                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                                {formData.hraDocuments.length > 0 && (
                                                    <div className="space-y-2">
                                                        {formData.hraDocuments.map((doc, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="p-2 rounded-lg bg-background">
                                                                        {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                                            <FileImage className="w-4 h-4 text-primary" />
                                                                        ) : (
                                                                            <FileText className="w-4 h-4 text-orange-500" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-foreground truncate max-w-fit">
                                                                            {doc.name || doc.filename}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatFileSize(doc.size)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {doc._id ? (
                                                                        <>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                                                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                                title="Preview"
                                                                            >
                                                                                <Eye className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                                                                className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                                                                title="Download"
                                                                            >
                                                                                <Download className="w-4 h-4" />
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        declaration?._id && (
                                                                            <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                                                <Clock className="w-4 h-4" />
                                                                            </div>
                                                                        )
                                                                    )}
                                                                    {!isReadOnly && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => removeDocument('hraDocuments', index)}
                                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* {!driveConnected && (
                                                    <p className="text-xs text-amber-600 mt-2">💡 Tip: Connect your Google Drive to upload documents automatically</p>
                                                )} */}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* LTA */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Exemption u/s 10 - Leave Travel Allowance (LTA)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox disabled={isReadOnly}
                                        checked={formData.exemptions.lta.isApplicable}
                                        onCheckedChange={(checked) =>
                                            handleDeepNestedChange('exemptions', 'lta', 'isApplicable', checked)
                                        }
                                    />
                                    <label className="text-sm font-medium">Claim LTA Exemption</label>
                                </div>

                                {formData.exemptions.lta.isApplicable && (
                                    <div className="space-y-4 bg-gray-50 p-4 rounded">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold">Claim Amount 2022</label>
                                                <Input disabled={isReadOnly}
                                                    type="number"
                                                    value={formData.exemptions.lta.claimsDetails.claims2022}
                                                    onChange={(e) =>
                                                        handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                            ...formData.exemptions.lta.claimsDetails,
                                                            claims2022: e.target.value
                                                        })
                                                    }
                                                    placeholder="Amount for 2022"
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold">Claim Amount 2023</label>
                                                <Input disabled={isReadOnly}
                                                    type="number"
                                                    value={formData.exemptions.lta.claimsDetails.claims2023}
                                                    onChange={(e) =>
                                                        handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                            ...formData.exemptions.lta.claimsDetails,
                                                            claims2023: e.target.value
                                                        })
                                                    }
                                                    placeholder="Amount for 2023"
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold">Claim Amount 2024</label>
                                                <Input disabled={isReadOnly}
                                                    type="number"
                                                    value={formData.exemptions.lta.claimsDetails.claims2024}
                                                    onChange={(e) =>
                                                        handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                            ...formData.exemptions.lta.claimsDetails,
                                                            claims2024: e.target.value
                                                        })
                                                    }
                                                    placeholder="Amount for 2024"
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold">Claim Amount 2025</label>
                                                <Input disabled={isReadOnly}
                                                    type="number"
                                                    value={formData.exemptions.lta.claimsDetails.claims2025}
                                                    onChange={(e) =>
                                                        handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                            ...formData.exemptions.lta.claimsDetails,
                                                            claims2025: e.target.value
                                                        })
                                                    }
                                                    placeholder="Amount for 2025"
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold">Claim Amount 2026</label>
                                                <Input disabled={isReadOnly}
                                                    type="number"
                                                    value={formData.exemptions.lta.claimsDetails.claims2026}
                                                    onChange={(e) =>
                                                        handleDeepNestedChange('exemptions', 'lta', 'claimsDetails', {
                                                            ...formData.exemptions.lta.claimsDetails,
                                                            claims2026: e.target.value
                                                        })
                                                    }
                                                    placeholder="Amount for 2026"
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div></div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox disabled={isReadOnly}
                                                    checked={formData.exemptions.lta.claimsDetails.willingToProduceBills === 'Yes'}
                                                    onCheckedChange={(checked) =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            exemptions: {
                                                                ...prev.exemptions,
                                                                lta: {
                                                                    ...prev.exemptions.lta,
                                                                    claimsDetails: {
                                                                        ...prev.exemptions.lta.claimsDetails,
                                                                        willingToProduceBills: checked ? 'Yes' : 'No'
                                                                    }
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                                <label className="text-sm font-medium">I agree to produce bills for verification</label>
                                            </div>

                                            {formData.exemptions.lta.claimsDetails.willingToProduceBills === 'Yes' && (
                                                <div className="border-t pt-4 mt-4">
                                                    <label className="block text-sm font-semibold mb-3">Upload LTA Bills & Documents</label>
                                                    {!isReadOnly && (
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/20 transition">
                                                                <Upload className="w-4 h-4" />
                                                                <span className="text-sm">Choose Files</span>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    onChange={(e) => handleDocumentUpload('ltaDocuments', e.target.files)}
                                                                    className="hidden"
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
                                                    {formData.ltaDocuments.length > 0 && (
                                                        <div className="space-y-2">
                                                            {formData.ltaDocuments.map((doc, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]"
                                                                >
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="p-2 rounded-lg bg-background">
                                                                            {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                                                <FileImage className="w-4 h-4 text-primary" />
                                                                            ) : (
                                                                                <FileText className="w-4 h-4 text-orange-500" />
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-medium text-foreground truncate max-w-fit">
                                                                                {doc.name || doc.filename}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {formatFileSize(doc.size)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {doc._id ? (
                                                                            <>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                                    title="Preview"
                                                                                >
                                                                                    <Eye className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                                                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                                                                    title="Download"
                                                                                >
                                                                                    <Download className="w-4 h-4" />
                                                                                </Button>
                                                                            </>
                                                                        ) : (
                                                                            declaration?._id && (
                                                                                <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                                                    <Clock className="w-4 h-4" />
                                                                                </div>
                                                                            )
                                                                        )}
                                                                        {!isReadOnly && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeDocument('ltaDocuments', index)}
                                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* {!driveConnected && (
                                                    <p className="text-xs text-amber-600 mt-2">💡 Tip: Connect your Google Drive to upload documents automatically</p>
                                                )} */}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Deductions Tab */}
                <TabsContent value="deductions">
                    <div className="space-y-4">
                        {/* Section 24 - Housing Loan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deduction u/s 24 - Interest on Housing Loan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {formData.housingLoanDeductions.map((loan, index) => (
                                        <div key={index} className="space-y-4 bg-gray-50 p-4 rounded border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                                    <div>
                                                        <label className="text-sm font-semibold">Property Type</label>
                                                        <Select disabled={isReadOnly}
                                                            value={loan.type}
                                                            onValueChange={(value) => handleHousingLoanUpdate(index, 'type', value)}
                                                        >
                                                            <SelectTrigger className="mt-2 text-sm">
                                                                <SelectValue placeholder="Select Property Type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Pre-1999 Self-Occupied">Pre-1999 Self-Occupied</SelectItem>
                                                                <SelectItem value="Post-1999 Self-Occupied">Post-1999 Self-Occupied</SelectItem>
                                                                <SelectItem value="Let-out Property">Let-out Property</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold">Interest Amount (Rs.)</label>
                                                        <Input disabled={isReadOnly}
                                                            type="number"
                                                            placeholder="Enter interest amount"
                                                            value={loan.amount}
                                                            onChange={(e) => handleHousingLoanUpdate(index, 'amount', e.target.value)}
                                                            className="mt-2"
                                                        />
                                                    </div>
                                                    {loan.type === 'Let-out Property' && (
                                                        <div>
                                                            <label className="text-sm font-semibold">Net Rental Income (Rs.)</label>
                                                            <Input disabled={isReadOnly}
                                                                type="number"
                                                                placeholder="Enter rental income"
                                                                value={loan.rentalIncome}
                                                                onChange={(e) => handleHousingLoanUpdate(index, 'rentalIncome', e.target.value)}
                                                                className="mt-2"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="text-sm font-semibold">Maximum Eligible Limit</label>
                                                        <div className="mt-2 p-2 bg-white border rounded text-sm text-muted-foreground">
                                                            {loan.maxLimit}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isReadOnly && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleHousingLoanRemove(index)}
                                                        className="ml-4"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="border-t pt-3">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Upload Banker's Certificate</label>
                                                {!isReadOnly && (
                                                    <Input disabled={isReadOnly}
                                                        type="file"
                                                        onChange={(e) => {
                                                            // Handle certificate upload specifically for this loan item if needed
                                                            // For now, we use the general document upload if collective
                                                        }}
                                                        className="text-xs"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {!isReadOnly && (
                                    <Button
                                        variant="outline"
                                        onClick={handleHousingLoanAdd}
                                        className="w-full"
                                    >
                                        + Add Housing Loan Deduction
                                    </Button>
                                )}

                                {/* Housing Loan Documents */}
                                <div className="border-t pt-4 mt-4">
                                    <label className="block text-sm font-semibold mb-3">Upload Housing Loan Banker's Certificates</label>
                                    {!isReadOnly && (
                                        <div className="flex items-center gap-3 mb-3">
                                            <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/50 rounded-md cursor-pointer hover:bg-primary/20 transition">
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">Choose Files</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleDocumentUpload('housingLoanDocuments', e.target.files)}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />
                                            </label>
                                        </div>
                                    )}
                                    {formData.housingLoanDocuments?.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.housingLoanDocuments.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 rounded-lg bg-background">
                                                            {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                                <FileImage className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-orange-500" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.filename}</p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {doc._id ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            declaration?._id && (
                                                                <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                                    <Clock className="w-4 h-4" />
                                                                </div>
                                                            )
                                                        )}
                                                        {!isReadOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeDocument('housingLoanDocuments', index)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 80C */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deduction u/s 80C (Max: Rs. 150,000)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {formData.section80CDeductions.map((deduction, index) => (
                                        <div key={index} className="flex gap-2 bg-gray-50 p-3 rounded">
                                            <div className='relative w-full'>
                                                <Select disabled={isReadOnly} value={deduction.itemName} onValueChange={(value) => handleSection80CUpdate(index, 'itemName', value)} className="flex-1">
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select deduction item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Life Insurance Premium (LIC)">Life Insurance Premium (LIC)</SelectItem>
                                                        <SelectItem value="Provident Fund (PF)">Provident Fund (PF)</SelectItem>
                                                        <SelectItem value="Public Provident Fund (PPF)">Public Provident Fund (PPF)</SelectItem>
                                                        <SelectItem value="Voluntary Provident Fund (VPF)">Voluntary Provident Fund (VPF)</SelectItem>
                                                        <SelectItem value="National Savings Certificate (NSC)">National Savings Certificate (NSC)</SelectItem>
                                                        <SelectItem value="Interest accrued on NSC (Re-invested)">Interest accrued on NSC (Re-invested)</SelectItem>
                                                        <SelectItem value="ULIP - Unit Linked Insurance Policy">ULIP - Unit Linked Insurance Policy</SelectItem>
                                                        <SelectItem value="ELSS - Equity Linked Savings Scheme">ELSS - Equity Linked Savings Scheme</SelectItem>
                                                        <SelectItem value="Tuition Fees for Children (Max 2)">Tuition Fees for Children (Max 2)</SelectItem>
                                                        <SelectItem value="Principal Repayment of Housing Loan">Principal Repayment of Housing Loan</SelectItem>
                                                        <SelectItem value="Stamp Duty & Registration (1st year only)">Stamp Duty & Registration (1st year only)</SelectItem>
                                                        <SelectItem value="Infrastructure Bonds">Infrastructure Bonds</SelectItem>
                                                        <SelectItem value="Bank FD (5+ years)">Bank FD (5+ years)</SelectItem>
                                                        <SelectItem value="Post Office TD (5+ years)">Post Office TD (5+ years)</SelectItem>
                                                        <SelectItem value="Senior Citizen Savings Scheme">Senior Citizen Savings Scheme</SelectItem>
                                                        <SelectItem value="Sukanya Samriddhi Account">Sukanya Samriddhi Account</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                            </div>
                                            <Input disabled={isReadOnly}
                                                type="number"
                                                placeholder="Amount"
                                                value={deduction.amount}
                                                onChange={(e) => {
                                                    handleSection80CUpdate(index, 'amount', e.target.value);
                                                }}
                                                className="w-32"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        handleSection80CRemove(index);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!isReadOnly && (
                                    <Button
                                        variant="outline"
                                        onClick={handleSection80CAdd}
                                        className="w-full"
                                    >
                                        + Add Deduction Item
                                    </Button>
                                )}

                                <div className="bg-primary/10 p-3 rounded border border-primary/50 text-muted-foreground">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total Amount (Max 150,000):</span>
                                        <span className="text-lg font-bold text-primary">Rs. {(formData.section80CTotal ? Number(formData.section80CTotal).toFixed(2) : "0.00")}</span>
                                    </div>
                                    {/* <div className="text-xs text-gray-600 space-y-1">
                                    <p><strong>Eligible Items:</strong></p>
                                    <ul className="list-disc pl-5">
                                        <li>Life Insurance Premium (LIC)</li>
                                        <li>Provident Fund (PF)</li>
                                        <li>Public Provident Fund (PPF)</li>
                                        <li>Voluntary Provident Fund (VPF)</li>
                                        <li>National Savings Certificate (NSC)</li>
                                        <li>ULIP - Unit Linked Insurance Policy</li>
                                        <li>ELSS - Equity Linked Savings Scheme</li>
                                        <li>Tuition Fees for Children (Max 2)</li>
                                        <li>Principal Repayment of Housing Loan</li>
                                        <li>Stamp Duty & Registration (1st year only)</li>
                                        <li>Infrastructure Bonds</li>
                                        <li>Bank FD (5+ years)</li>
                                        <li>Post Office TD (5+ years)</li>
                                        <li>Senior Citizen Savings Scheme</li>
                                        <li>Sukanya Samriddhi Account</li>
                                    </ul>
                                </div> */}
                                </div>

                                {/*
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-primary" />
                                            Medical Insurance Proofs
                                        </h4>
                                        <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                            <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium">Upload Proofs</span>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => handleDocumentUpload('section80DDocuments', e.target.files)}
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                        </label>
                                    </div>
                                 */}
                                {/* Section 80C Documents */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-primary" />
                                            Upload Section 80C Documents
                                        </h4>
                                        {!isReadOnly && (
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                                <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Upload Documents</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleDocumentUpload('section80CDocuments', e.target.files)}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {formData.section80CDocuments?.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.section80CDocuments.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 rounded-lg bg-background">
                                                            {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                                <FileImage className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-orange-500" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.filename}</p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {doc._id ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            declaration?._id && (
                                                                <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                                    <Clock className="w-4 h-4" />
                                                                </div>
                                                            )
                                                        )}
                                                        {!isReadOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeDocument('section80CDocuments', index)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pension Funds & NPS */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Pension Funds & NPS Contributions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Section 80CCC */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox disabled={isReadOnly}
                                            checked={formData.section80CCDeduction.isApplicable}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80CCDeduction: { ...prev.section80CCDeduction, isApplicable: checked }
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium">u/s 80CCC - Contribution to Pension Funds (Max 1.5L, shared with 80C)</label>
                                    </div>
                                    {formData.section80CCDeduction.isApplicable && (
                                        <Input disabled={isReadOnly}
                                            type="number"
                                            placeholder="Enter amount"
                                            value={formData.section80CCDeduction.amount}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80CCDeduction: { ...prev.section80CCDeduction, amount: e.target.value }
                                                }));
                                            }}
                                            className="ml-6"
                                        />
                                    )}
                                </div>

                                {/* Section 80CCD(1) */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox disabled={isReadOnly}
                                            checked={formData.section80CCD1Deduction.isApplicable}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80CCD1Deduction: { ...prev.section80CCD1Deduction, isApplicable: checked }
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium">u/s 80CCD(1) - Pension Scheme of Central Govt (Max 1.5L, shared with 80C)</label>
                                    </div>
                                    {formData.section80CCD1Deduction.isApplicable && (
                                        <Input disabled={isReadOnly}
                                            type="number"
                                            placeholder="Enter amount"
                                            value={formData.section80CCD1Deduction.amount}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80CCD1Deduction: { ...prev.section80CCD1Deduction, amount: e.target.value }
                                                }));
                                            }}
                                            className="ml-6"
                                        />
                                    )}
                                </div>

                                {/* Section 80CCD(1B) */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox disabled={isReadOnly}
                                            checked={formData.section80CCD1BDeduction.isApplicable}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80CCD1BDeduction: { ...prev.section80CCD1BDeduction, isApplicable: checked }
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium">u/s 80CCD(1B) - Additional NPS Contribution (Max Rs. 50,000/-)</label>
                                    </div>
                                    {formData.section80CCD1BDeduction.isApplicable && (
                                        <Input disabled={isReadOnly}
                                            type="number"
                                            placeholder="Enter amount"
                                            value={formData.section80CCD1BDeduction.amount}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80CCD1BDeduction: { ...prev.section80CCD1BDeduction, amount: e.target.value }
                                                }))
                                            }
                                            className="ml-6"
                                        />
                                    )}
                                </div>
                                {/* Pension/NPS Documents */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-primary" />
                                            Upload Pension/NPS Proofs
                                        </h4>
                                        {!isReadOnly && (
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                                <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Upload Proofs</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleDocumentUpload('section80CCDDocuments', e.target.files)}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {formData.section80CCDDocuments?.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.section80CCDDocuments.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 rounded-lg bg-background">
                                                            {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                                <FileImage className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-orange-500" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.filename}</p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {doc._id ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            declaration?._id && (
                                                                <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                                    <Clock className="w-4 h-4" />
                                                                </div>
                                                            )
                                                        )}
                                                        {!isReadOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeDocument('section80CCDDocuments', index)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>


                        {/* Section 80D - Medical Insurance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deduction u/s 80D - Medical Insurance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Checkbox disabled={isReadOnly}
                                            checked={formData.section80DDeductions.medicalInsuranceIndividual.isApplicable}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80DDeductions: {
                                                        ...prev.section80DDeductions,
                                                        medicalInsuranceIndividual: {
                                                            ...prev.section80DDeductions.medicalInsuranceIndividual,
                                                            isApplicable: checked
                                                        }
                                                    }
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium">Medical Insurance - Individual, Spouse & Children</label>
                                    </div>
                                    {formData.section80DDeductions.medicalInsuranceIndividual.isApplicable && (
                                        <div className="ml-6 space-y-3">
                                            <Input disabled={isReadOnly}
                                                type="number"
                                                placeholder="Enter amount (Max: Rs. 25,000 + 25,000 if Senior Citizen)"
                                                value={formData.section80DDeductions.medicalInsuranceIndividual.amount}
                                                onChange={(e) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        section80DDeductions: {
                                                            ...prev.section80DDeductions,
                                                            medicalInsuranceIndividual: {
                                                                ...prev.section80DDeductions.medicalInsuranceIndividual,
                                                                amount: e.target.value
                                                            }
                                                        }
                                                    }))
                                                }
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Checkbox disabled={isReadOnly}
                                                    checked={formData.section80DDeductions.medicalInsuranceIndividual.isSenior}
                                                    onCheckedChange={(checked) =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            section80DDeductions: {
                                                                ...prev.section80DDeductions,
                                                                medicalInsuranceIndividual: {
                                                                    ...prev.section80DDeductions.medicalInsuranceIndividual,
                                                                    isSenior: checked
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                                <label className="text-xs font-medium">Is Senior Citizen?</label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Checkbox disabled={isReadOnly}
                                            checked={formData.section80DDeductions.medicalInsuranceParents.isApplicable}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80DDeductions: {
                                                        ...prev.section80DDeductions,
                                                        medicalInsuranceParents: {
                                                            ...prev.section80DDeductions.medicalInsuranceParents,
                                                            isApplicable: checked
                                                        }
                                                    }
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium">Medical Insurance - Parents</label>
                                    </div>
                                    {formData.section80DDeductions.medicalInsuranceParents.isApplicable && (
                                        <div className="ml-6 space-y-3">
                                            <Input disabled={isReadOnly}
                                                type="number"
                                                placeholder="Enter amount (Max: Rs. 25,000 + 25,000 if Senior Citizen)"
                                                value={formData.section80DDeductions.medicalInsuranceParents.amount}
                                                onChange={(e) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        section80DDeductions: {
                                                            ...prev.section80DDeductions,
                                                            medicalInsuranceParents: {
                                                                ...prev.section80DDeductions.medicalInsuranceParents,
                                                                amount: e.target.value
                                                            }
                                                        }
                                                    }))
                                                }
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Checkbox disabled={isReadOnly}
                                                    checked={formData.section80DDeductions.medicalInsuranceParents.isSenior}
                                                    onCheckedChange={(checked) =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            section80DDeductions: {
                                                                ...prev.section80DDeductions,
                                                                medicalInsuranceParents: {
                                                                    ...prev.section80DDeductions.medicalInsuranceParents,
                                                                    isSenior: checked
                                                                }
                                                            }
                                                        }))
                                                    }
                                                />
                                                <label className="text-xs font-medium">Is Senior Citizen?</label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Checkbox disabled={isReadOnly}
                                            checked={formData.section80DDeductions.preventiveHealthCheckup.isApplicable}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80DDeductions: {
                                                        ...prev.section80DDeductions,
                                                        preventiveHealthCheckup: {
                                                            ...prev.section80DDeductions.preventiveHealthCheckup,
                                                            isApplicable: checked
                                                        }
                                                    }
                                                }))
                                            }
                                        />
                                        <label className="text-sm font-medium">Preventive Health Check-up</label>
                                    </div>
                                    {formData.section80DDeductions.preventiveHealthCheckup.isApplicable && (
                                        <Input disabled={isReadOnly}
                                            type="number"
                                            placeholder="Enter amount (Max: Rs. 5,000)"
                                            value={formData.section80DDeductions.preventiveHealthCheckup.amount}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    section80DDeductions: {
                                                        ...prev.section80DDeductions,
                                                        preventiveHealthCheckup: {
                                                            ...prev.section80DDeductions.preventiveHealthCheckup,
                                                            amount: e.target.value
                                                        }
                                                    }
                                                }))
                                            }
                                            className="ml-6"
                                        />
                                    )}
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-primary" />
                                            Medical Insurance Proofs
                                        </h4>
                                        {!isReadOnly && (
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                                <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Upload Proofs</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleDocumentUpload('section80DDocuments', e.target.files)}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {formData.section80DDocuments?.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.section80DDocuments.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group max-w-[500px]">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 rounded-lg bg-background">
                                                            {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                                <FileImage className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-orange-500" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.filename}</p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {doc._id ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/preview/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(`${API_BASE_URL}/api/investmentDeclaration/document/download/${doc._id}`, "_blank")}
                                                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            declaration?._id && (
                                                                <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                                    <Clock className="w-4 h-4" />
                                                                </div>
                                                            )
                                                        )}
                                                        {!isReadOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeDocument('section80DDocuments', index)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 80E - Education Loan Interest */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deduction u/s 80E - Interest on Education Loan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Checkbox disabled={isReadOnly}
                                        checked={formData.section80EDeduction.isApplicable}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                section80EDeduction: {
                                                    ...prev.section80EDeduction,
                                                    isApplicable: checked
                                                }
                                            }))
                                        }
                                    />
                                    <label className="text-sm font-medium">Claim Interest on Education Loan Deduction</label>
                                </div>
                                {formData.section80EDeduction.isApplicable && (
                                    <Input disabled={isReadOnly}
                                        type="number"
                                        placeholder="Enter interest amount (No limit)"
                                        value={formData.section80EDeduction.amount}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                section80EDeduction: {
                                                    ...prev.section80EDeduction,
                                                    amount: e.target.value
                                                }
                                            }))
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Section 80TTA - Savings Account Interest */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deduction u/s 80TTA - Interest on Savings Account</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Checkbox disabled={isReadOnly}
                                        checked={formData.section80TTADeduction.isApplicable}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                section80TTADeduction: {
                                                    ...prev.section80TTADeduction,
                                                    isApplicable: checked
                                                }
                                            }))
                                        }
                                    />
                                    <label className="text-sm font-medium">Claim Savings Account Interest Deduction</label>
                                </div>
                                {formData.section80TTADeduction.isApplicable && (
                                    <Input disabled={isReadOnly}
                                        type="number"
                                        placeholder="Enter interest amount (Max: Rs. 10,000)"
                                        value={formData.section80TTADeduction.amount}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                section80TTADeduction: {
                                                    ...prev.section80TTADeduction,
                                                    amount: e.target.value
                                                }
                                            }))
                                        }
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Other Deductions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Other Deductions / Tax Reliefs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold">Description</label>
                                        <Input disabled={isReadOnly}
                                            placeholder="Enter description"
                                            value={formData.otherDeductions?.description}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    otherDeductions: { ...prev.otherDeductions, description: e.target.value }
                                                }))
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold">Amount (Rs.)</label>
                                        <Input disabled={isReadOnly}
                                            type="number"
                                            placeholder="Enter amount"
                                            value={formData.otherDeductions?.amount}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    otherDeductions: { ...prev.otherDeductions, amount: e.target.value }
                                                }))
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Previous Income Tab */}
                <TabsContent value="previous-income">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Income from Previous Employment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold">Income after Exemptions (Rs.)</label>
                                    <Input disabled={isReadOnly}
                                        type="number"
                                        value={formData.previousEmploymentIncome.incomeAfterExemptions}
                                        onChange={(e) =>
                                            handleNestedChange('previousEmploymentIncome', 'incomeAfterExemptions', e.target.value)
                                        }
                                        placeholder="Enter income amount"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold">Provident Fund (PF) (Rs.)</label>
                                    <Input disabled={isReadOnly}
                                        type="number"
                                        value={formData.previousEmploymentIncome.providentFund}
                                        onChange={(e) =>
                                            handleNestedChange('previousEmploymentIncome', 'providentFund', e.target.value)
                                        }
                                        placeholder="Enter PF amount"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold">Professional Tax (PT) (Rs.)</label>
                                    <Input disabled={isReadOnly}
                                        type="number"
                                        value={formData.previousEmploymentIncome.professionalTax}
                                        onChange={(e) =>
                                            handleNestedChange('previousEmploymentIncome', 'professionalTax', e.target.value)
                                        }
                                        placeholder="Enter PT amount"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold">Tax Deducted At Source (TDS) (Rs.)</label>
                                    <Input disabled={isReadOnly}
                                        type="number"
                                        value={formData.previousEmploymentIncome.tds}
                                        onChange={(e) =>
                                            handleNestedChange('previousEmploymentIncome', 'tds', e.target.value)
                                        }
                                        placeholder="Enter TDS amount"
                                        className="mt-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Income from Other Sources */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Income From Other Sources</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {(formData.incomeFromOtherSources || []).map((source, index) => (
                                        <div key={index} className="flex gap-2 bg-gray-50 p-3 rounded">
                                            <Input disabled={isReadOnly}
                                                placeholder="Description (e.g. Interest, Rental)"
                                                value={source.description}
                                                onChange={(e) => {
                                                    const updated = [...formData.incomeFromOtherSources];
                                                    updated[index].description = e.target.value;
                                                    handleInputChange('incomeFromOtherSources', updated);
                                                }}
                                                className="flex-1"
                                            />
                                            <Input disabled={isReadOnly}
                                                type="number"
                                                placeholder="Amount"
                                                value={source.amount}
                                                onChange={(e) => {
                                                    const updated = [...formData.incomeFromOtherSources];
                                                    updated[index].amount = e.target.value;
                                                    handleInputChange('incomeFromOtherSources', updated);
                                                }}
                                                className="w-32"
                                            />
                                            {!isReadOnly && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = formData.incomeFromOtherSources.filter((_, i) => i !== index);
                                                        handleInputChange('incomeFromOtherSources', updated);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!isReadOnly && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const updated = [...(formData.incomeFromOtherSources || []), { description: '', amount: '' }];
                                            handleInputChange('incomeFromOtherSources', updated);
                                        }}
                                        className="w-full"
                                    >
                                        + Add Other Source
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Final Declaration & Attestation */}
            <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        Declaration & Attestation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground italic">
                        "{formData.declaration.agreementText}"
                    </p>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox disabled={isReadOnly}
                                id="declaration-agree"
                                checked={formData.declaration.isAgreed}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        declaration: { ...prev.declaration, isAgreed: checked }
                                    }))
                                }
                            />
                            <label htmlFor="declaration-agree" className="text-sm font-semibold cursor-pointer">
                                I confirm and agree to the above declaration
                            </label>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-semibold mb-2 block">Employee Signature (Type Full Name)</label>
                            <Input disabled={isReadOnly}
                                placeholder="Enter your full name as signature"
                                value={formData.declaration.employeeSignature}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        declaration: { ...prev.declaration, employeeSignature: e.target.value }
                                    }))
                                }
                                className="bg-white border-primary/20"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-primary/20">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-primary" />
                                Upload Signed Declaration
                            </h4>
                            {!isReadOnly && (
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors border border-primary/20 group">
                                    <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">Upload File</span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleDocumentUpload('declarationDocuments', e.target.files)}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                </label>
                            )}
                        </div>
                        {formData.declarationDocuments?.length > 0 && (
                            <div className="space-y-2">
                                {formData.declarationDocuments.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white border border-border/50 group max-w-[500px]">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 rounded-lg bg-background">
                                                {doc.file?.type?.startsWith("image/") || (doc.filename && /\.(jpg|jpeg|png|gif)$/i.test(doc.filename)) ? (
                                                    <FileImage className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-orange-500" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{doc.name || doc.filename}</p>
                                                <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {doc.driveWebViewLink || doc.driveUrl ? (
                                                <div className="h-8 w-8 flex items-center justify-center text-green-600" title="Uploaded">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                declaration?._id && (
                                                    <div className="h-8 w-8 flex items-center justify-center text-amber-700" title="Pending upload after submit">
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                )
                                            )}
                                            {!isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeDocument('declarationDocuments', index)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            Tip: You can upload a signed copy of this declaration for record-keeping.
                        </p>
                    </div>
                </CardContent>
            </Card>


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
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Submitting...' : declaration ? 'Edit Declaration' : 'Submit Declaration'}
                    </Button>
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
