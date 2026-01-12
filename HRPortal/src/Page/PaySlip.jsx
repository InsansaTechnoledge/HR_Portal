import React, { useState, useRef, useEffect, useContext } from 'react';
import { Building2,
  Mail,
  Phone,
  Download,
  FileCheck,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Wallet,
  RotateCcw,
  Save,
  Check,
  Loader2,
  Badge,
  FileText, 
  ChevronDown} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import API_BASE_URL from '../config';
import axios from 'axios';
import { userContext } from '../Context/userContext';
import Loader from '../Components/Loader/Loader';
import { companyDetails } from '../Constant/constant';
import TemplateClassic from '../templates/TemplateClassic';
import TemplateCorporate from '../templates/TemplateCorporate';
import TemplateMinimal from '../templates/TemplateMinimal';
import TemplateModern from '../templates/TemplateModern';
import TemplateDefault from '../templates/TemplateDefault';

import { Card, CardHeader, CardTitle, CardContent } from '../Components/ui/Card';
import { Input } from '../Components/ui/Input';
import { Label } from '../Components/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Components/ui/Select';
import { RadioGroup, RadioGroupItem } from '../Components/ui/RadioGroup';
import { Briefcase, Calculator, User, Hash, Calendar, CreditCard } from 'lucide-react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription} from '../Components/ui/Dialog';
import {Tabs, TabsList, TabsTrigger} from '../Components/ui/Tabs';
import { Button } from '../Components/ui/Button';
import { toast } from '../hooks/useToast';

const PayslipGenerator = () => {
    const payslipRef = useRef();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [payslip, setPayslip] = useState();
    const professionalTax = 200;
    const [employees, setEmployees] = useState([]);
    const {user} = useContext(userContext);
    const [taxType, setTaxType] = useState("Professional Tax");
    const [loading, setLoading] = useState(true);
    
    // NEW: state to show template selection after clicking generate
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState("classic");
    const [finalTemplate, setFinalTemplate] = useState(null);
    const [showPayslipPreview, setShowPayslipPreview] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/employee/`, {
                    params: { 
                        fields: "name,empId,email,department,details.designation,details.accountNumber,details.panNumber,details.salary,details.uanNumber", 
                        limit: 200 
                    },
                    signal,
                });
                if(response.status===200 || response.status===201){
                    setEmployees(response.data.employees);
                }
            } catch (err) {
                if (axios.isCancel?.(err)) return;
                console.error("Error fetching employees for payslip generator:", err);
                toast ({    
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch employees.",
                });
            } finally {
                setLoading(false);
            }
        }

        fetchEmployees();
        return () => controller.abort();
    }, [])

    const [employeeData, setEmployeeData] = useState({
        name: '',
        employeeId: '',
        email: '',
        department: '',
        designation: '',
        month: '',
        year: '',
        salary: '',
        hra: 0,
        conveyanceAllowance: 0,
        medicalAllowance: 0,
        specialAllowance: 0,
        bankAccount: '',
        panNumber: '',
        uanNumber: '',
    });

    const renderTemplate = (template) => {
        if (!template) return null;

        const net = calculateNetSalary();

        const calculations = {
            totalEarnings: calculateTotalEarnings().toFixed(2),
            totalDeductions: Object.values(calculateDeductions())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
            netSalary: net.toFixed(2),
            deductions: calculateDeductions(),
        };

        const props = {
            data: employeeData,
            company: companyDetails,
            calculations,
        };

        switch (template) {
            case "classic":
                return <TemplateClassic {...props} />;
            case "modern":
                return <TemplateModern {...props} />;
            case "minimal":
                return <TemplateMinimal {...props} />;
            case "corporate":
                return <TemplateCorporate {...props} />;
            case "Default":
                return <TemplateDefault {...props} />;
            default:
                return null;
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEmployeeSelect = (value) => {
        const selectedEmployee = employees.find(emp => emp.name === value);

        if (selectedEmployee && selectedEmployee.details) {
            setEmployeeData(prev => ({
                ...prev,
                name: selectedEmployee.name,
                employeeId: selectedEmployee.empId,
                email: selectedEmployee.email,
                department: selectedEmployee.department,
                designation: selectedEmployee.details.designation,
                bankAccount: selectedEmployee.details.accountNumber,
                panNumber: selectedEmployee.details.panNumber,
                salary: selectedEmployee.details.salary || 0,
                uanNumber: selectedEmployee.details.uanNumber || '',
                hra: 0,
                conveyanceAllowance: 0,
                medicalAllowance: 0,
                specialAllowance: 0,
                month: '',
            }));
        } else {
            toast ({
                variant: "destructive",
                title: "Error",
                description: "Employee details are incomplete.",
            });
        }
    };


    const calculateDeductions = () => {
        const salary = parseFloat(employeeData.salary) || 0;
        if(taxType==='Professional Tax'){
            return { professionalTax };
        }
        else{
            return { TDS: salary * 0.1 };
        }
    };

    const calculateTotalEarnings = () => {
        return (
            (parseFloat(employeeData.salary) || 0) +
            (parseFloat(employeeData.hra) || 0) +
            (parseFloat(employeeData.conveyanceAllowance) || 0) +
            (parseFloat(employeeData.medicalAllowance) || 0) +
            (parseFloat(employeeData.specialAllowance) || 0)
        );
    };

    const calculateNetSalary = () => {
        const totalEarnings = calculateTotalEarnings();
        if(taxType==="Professional Tax"){
            const { professionalTax } = calculateDeductions();
            if(!totalEarnings) return totalEarnings;
            return totalEarnings - professionalTax;
        }
        else{
            const { TDS } = calculateDeductions();
            return totalEarnings - TDS;
        }
    };

    const handleGeneratePayslip = (e) => {
        e.preventDefault();
    if (!employeeData.name || !employeeData.month) {
        toast ({
            // variant: "destructive",
            title: "Error",
            description: "Please fill required fields.",
        });
        return;
    }

    setShowTemplateDialog(true);
};

const handleConfirmTemplate = async () => {
    try {
        setIsGeneratingPDF(true);
        const net = calculateNetSalary();

        const payload = {
            generatedBy: user?.userEmail || "Admin",
            employeeId: employeeData.employeeId,
            name: employeeData.name,
            department: employeeData.department,
            designation: employeeData.designation,
            month: employeeData.month,
            salary: employeeData.salary,

            hra: employeeData.hra,
            conveyanceAllowance: employeeData.conveyanceAllowance,
            medicalAllowance: employeeData.medicalAllowance,
            specialAllowance: employeeData.specialAllowance,

            professionalTax: taxType === "Professional Tax" ? professionalTax : 0,
            TDS: taxType === "TDS" ? employeeData.salary * 0.1 : 0,
            incomeTax: 0,

            totalEarnings: calculateTotalEarnings(),
            totalDeductions: Object.values(calculateDeductions()).reduce((a,b)=>a+b,0),
            netSalary: net,

            bankAccount: employeeData.bankAccount,
            panNumber: employeeData.panNumber,
            uanNumber: employeeData.uanNumber,
            taxType,
            template: activeTemplate,
        };

        await axios.post(
            `${API_BASE_URL}/api/payslip/generate`,
            payload,
            { withCredentials: true }
        );

        setFinalTemplate(activeTemplate);
        setShowTemplateDialog(false);
        setShowPayslipPreview(true);

        toast ({    
            variant: "success",
            title: "Success",
            description: "Payslip generated successfully.",
        });

    } catch (err) {
        toast ({
            variant: "destructive", 
            title: "Error",
            description: "Failed to generate payslip.",
        });
    } finally {
        setIsGeneratingPDF(false);
    }
};

    const handleReset = () => {
        setEmployeeData({
            name: '',
            employeeId: '',
            department: '',
            designation: '',
            month: '',
            year: '',
            salary: '',
            hra: 0,
            conveyanceAllowance: 0,
            medicalAllowance: 0,
            specialAllowance: 0,
            bankAccount: '',
            panNumber: '',
            uanNumber: '',
        });
        setShowPayslipPreview(false);
        
        // setTemplateForPDF(null);
        // setShowTemplateSelection(false);
    };

    const generatePDF = async () => {
        if (!payslipRef.current) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(payslipRef.current, {
                scale: 3,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let position = 0;
            let remainingHeight = imgHeight;

            while (remainingHeight > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                remainingHeight -= pdfHeight;

                if (remainingHeight > 0) {
                    pdf.addPage();
                    position = -pdfHeight * (imgHeight / pdfHeight);
                }
            }

            pdf.save(`payslip-${employeeData.name}-${employeeData.month}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast ({
                variant: "destructive",
                title: "Error",
                description: "Failed to generate PDF.",
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if(loading){
        return <Loader/>
    }
    const templateOptions = [
        { id: "classic", name: "Classic" },
        { id: "modern", name: "Modern" },
        { id: "minimal", name: "Minimal" },
        { id: "corporate", name: "Corporate" },
        { id: "default", name: "Default" },
    ];
    return (
        <>
        <div className="min-h-screen bg-background p-4 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 lg:p-8 text-primary-foreground">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">Payslip Generator</h1>
                        <p className="text-primary-foreground/80">Generate professional payslips for employees</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <Building2 className="w-5 h-5" />
                    <div className="text-right">
                        <p className="font-semibold">{companyDetails.name}</p>
                        <p className="text-xs text-primary-foreground/70">{companyDetails.city}</p>
                    </div>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute -right-5 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
                </div>

                {/* Main Form */}
                {!showPayslipPreview ? (
                <form onSubmit={handleGeneratePayslip} className="space-y-6">
                    {/* Employee Selection & Tax Type */}
                    <div className="grid lg:grid-cols-2 gap-6">
                    {/* Employee Selection */}
                    <Card className="border-0 shadow-card">
                        <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-primary" />
                            Select Employee
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="relative">
                            <Select onValueChange={handleEmployeeSelect} value={employeeData.name}>
                                <SelectTrigger className="w-full">
                                <SelectValue placeholder="-- Select Employee --" />
                                </SelectTrigger>
                                <SelectContent>
                                {employees.map(emp => (
                                    <SelectItem key={emp.empId} value={emp.name}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                        <p className="font-medium">{emp.name}</p>
                                        <p className="text-xs text-muted-foreground">{emp.empId} • {emp.department}</p>
                                        </div>
                                    </div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                        </div>
                        
                        </CardContent>
                    </Card>

                    {/* Tax Type Selection */}
                    <Card className="border-0 shadow-card">
                        <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="w-5 h-5 text-hr-amber" />
                            Tax Type
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <RadioGroup value={taxType} onValueChange={setTaxType} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Professional Tax" id="professionalTax" />
                            <Label htmlFor="professionalTax" className="cursor-pointer">
                                <span className="font-medium">Professional Tax</span>
                                <p className="text-xs text-muted-foreground">Fixed ₹200</p>
                            </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TDS" id="tds" />
                            <Label htmlFor="tds" className="cursor-pointer">
                                <span className="font-medium">TDS</span>
                                <p className="text-xs text-muted-foreground">10% of salary</p>
                            </Label>
                            </div>
                        </RadioGroup>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Employee Details */}
                    <Card className="border-0 shadow-card">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                        <Briefcase className="w-5 h-5 text-info" />
                        Employee Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Employee Name <span className="text-destructive">*</span></Label>
                            <Input
                            id="name"
                            name="name"
                            value={employeeData.name}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID <span className="text-destructive">*</span></Label>
                            <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="employeeId"
                                name="employeeId"
                                value={employeeData.employeeId}
                                onChange={handleInputChange}
                                placeholder="EMP-001"
                                className="pl-10"
                                required
                            />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                            <Input
                            id="department"
                            name="department"
                            value={employeeData.department}
                            onChange={handleInputChange}
                            placeholder="Engineering"
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation <span className="text-destructive">*</span></Label>
                            <Input
                            id="designation"
                            name="designation"
                            value={employeeData.designation}
                            onChange={handleInputChange}
                            placeholder="Software Engineer"
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="month">Pay Period <span className="text-destructive">*</span></Label>
                            <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="month"
                                name="month"
                                type="month"
                                value={employeeData.month}
                                onChange={handleInputChange}
                                className="pl-10"
                                required
                            />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bankAccount">Bank Account <span className="text-destructive">*</span></Label>
                            <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="bankAccount"
                                name="bankAccount"
                                value={employeeData.bankAccount}
                                onChange={handleInputChange}
                                placeholder="XXXX1234"
                                className="pl-10"
                                required
                            />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="panNumber">PAN Number <span className="text-destructive">*</span></Label>
                            <Input
                            id="panNumber"
                            name="panNumber"
                            value={employeeData.panNumber}
                            onChange={handleInputChange}
                            placeholder="ABCDE1234F"
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="uanNumber">UAN Number</Label>
                            <Input
                            id="uanNumber"
                            name="uanNumber"
                            value={employeeData.uanNumber}
                            onChange={handleInputChange}
                            placeholder="123456789012"
                            />
                        </div>
                        </div>
                    </CardContent>
                    </Card>

                    {/* Salary & Allowances */}
                    <div className="grid lg:grid-cols-2 gap-6">
                    {/* Earnings */}
                    <Card className="border-0 shadow-card">
                        <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-success" />
                            Earnings
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="salary">Basic Salary <span className="text-destructive">*</span></Label>
                            <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="salary"
                                name="salary"
                                type="number"
                                value={employeeData.salary}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="pl-10"
                                required
                            />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="hra">HRA</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                id="hra"
                                name="hra"
                                type="number"
                                value={employeeData.hra}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="pl-10"
                                disabled
                                />
                            </div>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="conveyanceAllowance">Conveyance</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                id="conveyanceAllowance"
                                name="conveyanceAllowance"
                                type="number"
                                value={employeeData.conveyanceAllowance}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="pl-10"
                                disabled
                                />
                            </div>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="medicalAllowance">Medical</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                id="medicalAllowance"
                                name="medicalAllowance"
                                type="number"
                                value={employeeData.medicalAllowance}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="pl-10"
                                disabled
                                />
                            </div>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="specialAllowance">Special</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                id="specialAllowance"
                                name="specialAllowance"
                                type="number"
                                value={employeeData.specialAllowance}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="pl-10"
                                disabled
                                />
                            </div>
                            </div>
                        </div>
                        <div className="pt-3 border-t flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Total Earnings</span>
                            <span className="text-xl font-bold text-success">₹{calculateTotalEarnings().toLocaleString('en-IN')}</span>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Deductions */}
                    <Card className="border-0 shadow-card">
                        <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingDown className="w-5 h-5 text-destructive" />
                            Deductions
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            {taxType === 'Professional Tax' ? (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Professional Tax</span>
                                <Badge variant="outline" className="font-mono">₹{professionalTax}</Badge>
                            </div>
                            ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                <span className="text-muted-foreground">TDS (10%)</span>
                                <p className="text-xs text-muted-foreground">Tax Deducted at Source</p>
                                </div>
                                <Badge variant="outline" className="font-mono">
                                ₹{((parseFloat(String(employeeData.salary)) || 0) * 0.1).toLocaleString('en-IN')}
                                </Badge>
                            </div>
                            )}
                        </div>
                        <div className="pt-3 border-t flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Total Deductions</span>
                            <span className="text-xl font-bold text-destructive">
                            -₹{Object.values(calculateDeductions()).reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Net Salary Summary */}
                    <Card className="shadow-elevated bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                            <Wallet className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                            <p className="text-sm text-muted-foreground">Net Salary</p>
                            <p className="text-3xl lg:text-4xl font-bold text-primary">
                                ₹{calculateNetSalary().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Reset
                            </Button>
                            <Button type="submit" className="gap-2">
                            <Save className="w-4 h-4" />
                            Generate Payslip
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                </form>
                ) : (
                /* Payslip Preview */
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                        <Check className="w-5 h-5 text-success" />
                        </div>
                        <div>
                        <p className="font-medium">Payslip Generated Successfully</p>
                        <p className="text-sm text-muted-foreground">
                            {employeeData.name} • {employeeData.month}
                        </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Generate New
                        </Button>
                        <Button 
                        onClick={generatePDF} 
                        disabled={isGeneratingPDF}
                        className="gap-2"
                        >
                        {isGeneratingPDF ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Download PDF
                        </Button>
                    </div>
                    </div>

                    {/* Payslip Template Preview */}
                    <div className="overflow-auto rounded-xl border shadow-card bg-white" ref={payslipRef}>
                    <div className="min-w-[800px]">
                        {finalTemplate && renderTemplate(finalTemplate)}
                    </div>
                    </div>
                </div>
                )}
            </div>

            {/* Template Selection Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Select Payslip Template
                    </DialogTitle>
                    <DialogDescription>
                    Choose a template design for the payslip
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Template Tabs */}
                    <Tabs value={activeTemplate} onValueChange={setActiveTemplate} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-5 w-full">
                        {templateOptions.map(template => (
                        <TabsTrigger key={template.id} value={template.id} className="capitalize">
                            {template.name}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="flex-1 mt-4 border rounded-xl bg-muted/30 p-4 overflow-auto max-h-[500px]">
                        <div className="scale-[0.6] origin-top-left w-[166%]">
                        {renderTemplate(activeTemplate)}
                        </div>
                    </div>
                    </Tabs>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                    Cancel
                    </Button>
                    <Button onClick={handleConfirmTemplate} disabled={isGeneratingPDF} className="gap-2">
                    {isGeneratingPDF ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                    Confirm & Generate
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </>
    );
};

export default PayslipGenerator;
