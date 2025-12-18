import React, { useState, useRef, useEffect, useContext } from 'react';
import { Building2, Mail, Phone, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import API_BASE_URL from '../config';
import axios from 'axios';
import { userContext } from '../Context/userContext';
import Loader from '../Components/Loader/Loader';
import ErrorToast from '../Components/Toaster/ErrorToaster';
import SuccessToast from '../Components/Toaster/SuccessToaser';
import { companyDetails } from '../Constant/constant';
import TemplateClassic from '../templates/TemplateClassic';
import TemplateCorporate from '../templates/TemplateCorporate';
import TemplateMinimal from '../templates/TemplateMinimal';
import TemplateModern from '../templates/TemplateModern';
import TemplateDefault from '../templates/TemplateDefault';

const PayslipGenerator = () => {
    const payslipRef = useRef();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [payslip, setPayslip] = useState();
    const professionalTax = 200;
    const [employees, setEmployees] = useState();
    const {user} = useContext(userContext);
    const [taxType, setTaxType] = useState("Professional Tax");
    const [loading, setLoading] = useState(true);
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
    const [toastErrorMessage, setToastErrorMessage] = useState();
    const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
    const [toastErrorVisible, setToastErrorVisible] = useState(false);
    
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
                        fields: "name,empId,department,details.designation,details.accountNumber,details.panNumber,details.salary,details.uanNumber", 
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

        const calculations = {
            totalEarnings: calculateTotalEarnings().toFixed(2),
            totalDeductions: Object.values(calculateDeductions())
                .reduce((a, b) => a + b, 0)
                .toFixed(2),
            netSalary: calculateNetSalary().toFixed(2),
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

    const handleEmployeeSelect = (e) => {
        const selectedEmployee = employees.find(emp => emp.name === e.target.value);
        if (selectedEmployee && selectedEmployee.details) {
            setEmployeeData({
                ...employeeData,
                name: selectedEmployee.name,
                employeeId: selectedEmployee.empId,
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
            });
        }
        else{
            setToastErrorMessage("employee detail not available");
            setToastErrorVisible(true);
            setTimeout(() => setToastErrorVisible(false), 3500);
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
            return totalEarnings - professionalTax;
        }
        else{
            const { TDS } = calculateDeductions();
            return totalEarnings - TDS;
        }
    };

    const handleGeneratePayslip = (e) => {
        e.preventDefault();

        // validation (optional)
        if (!employeeData.name || !employeeData.month) {
            setToastErrorMessage("Please fill required fields");
            setToastErrorVisible(true);
            setTimeout(() => setToastErrorVisible(false), 3000);
            return;
        }

        setShowTemplateDialog(true);
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
        
        setTemplateForPDF(null);
        setShowTemplateSelection(false);
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
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if(loading){
        return <Loader/>
    }

    return (
        <>
        {
            toastSuccessVisible ? <SuccessToast message={toastSuccessMessage}/> : null
        }
        {
            toastErrorVisible ? <ErrorToast error={toastErrorMessage}/> : null
        }
        <div className="max-w-5xl mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-indigo-600">Employee Payslip Generator</h2>
                    <div className="text-right">
                        <Building2 className="inline-block mb-2" size={24} />
                        <p className="font-bold text-gray-800">{companyDetails.name}</p>
                    </div>


                    
                </div>  

                <div className="space-y-4 mt-4 mb-4">
                    <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700">
                        Select Employee
                    </label>
                    <select
                        id="employeeSelect"
                        onChange={handleEmployeeSelect}
                        className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">-- Select Employee --</option>
                        {employees && employees.map(emp => (
                            <option key={emp.employeeId} value={emp.name}>
                                {emp.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4 mt-4 mb-4">
    <label htmlFor="taxSelect" className="block text-sm font-medium text-gray-700">
        Select Tax Type
    </label>
    <div className="flex items-center space-x-4">
        <div className="flex items-center">
            <input
                id="professionalTax"
                type="radio"
                defaultChecked
                name="tax"
                value="Professional Tax"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label
                htmlFor="professionalTax"
                className="ml-2 text-sm text-gray-700"
            >
                Professional Tax
            </label>
        </div>
        <div className="flex items-center">
            <input
                id="tds"
                type="radio"
                name="tax"
                value="TDS"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label
                htmlFor="tds"
                className="ml-2 text-sm text-gray-700"
            >
                TDS
            </label>
        </div>
    </div>
</div>


                <form onSubmit={handleGeneratePayslip} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Employee Name', name: 'name' },
                            { label: 'Employee ID', name: 'employeeId' },
                            { label: 'Department', name: 'department' },
                            { label: 'Designation', name: 'designation' },
                            { label: 'Month', name: 'month', type: 'month' },
                            { label: 'Bank Account', name: 'bankAccount' },
                            { label: 'PAN Number', name: 'panNumber' },
                            { label: 'UAN Number', name: 'uanNumber' },
                            { label: 'Basic Salary', name: 'salary', type: 'number' },
                            { label: 'HRA', name: 'hra', type: 'number', disabled: true },
                            { label: 'Conveyance Allowance', name: 'conveyanceAllowance', type: 'number', disabled: true },
                            { label: 'Medical Allowance', name: 'medicalAllowance', type: 'number', disabled: true },
                            { label: 'Special Allowance', name: 'specialAllowance', type: 'number', disabled: true },
                        ].map(({ label, name, type = 'text', disabled }) => (
                            <div key={name} className="space-y-2">
                                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                                    {label}
                                </label>
                                <input
                                    id={name}
                                    name={name}
                                    type={type}
                                    value={employeeData[name]}
                                    onChange={handleInputChange}
                                    required = {label==="UAN Number" ? false : true}
                                    disabled={disabled}
                                    className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            Generate Payslip
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* NEW: Template selection dialog after clicking generate */}
            {showTemplateDialog && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-xl w-[90%] max-w-4xl max-h-[90vh] p-5 flex flex-col">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Select Payslip Template</h3>
                            <button
                                onClick={() => setShowTemplateDialog(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ✕
                            </button>
                        </div>

                        {/* TABS */}
                        <div className="flex gap-3 mb-4">
                            {["classic", "modern", "minimal", "corporate", "Default"].map(tpl => (
                                <button
                                    key={tpl}
                                    onClick={() => setActiveTemplate(tpl)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium
                                        ${activeTemplate === tpl
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* PREVIEW */}
                        <div className="border rounded-lg p-3 h-[420px] overflow-auto bg-gray-50">
                            {renderTemplate(activeTemplate)}
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowTemplateDialog(false)}
                                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setFinalTemplate(activeTemplate);
                                    setShowTemplateDialog(false);
                                    setShowPayslipPreview(true);

                                    setToastSuccessMessage("Payslip generated successfully");
                                    setToastSuccessVisible(true);
                                    setTimeout(() => setToastSuccessVisible(false), 3000);
                                }}
                                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Select Template
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Show Payslip preview after selecting template */}
            {showPayslipPreview && finalTemplate && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={generatePDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Download size={18} />
                            {isGeneratingPDF ? "Generating..." : "Download PDF"}
                        </button>
                    </div>

                    <div ref={payslipRef}>
                        {renderTemplate(finalTemplate)}
                    </div>
                </>
            )}

        </div>
        </>
    );
};

export default PayslipGenerator;
