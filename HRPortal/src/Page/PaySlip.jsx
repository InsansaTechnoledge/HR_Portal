import React, { useState, useRef } from 'react';
import { Building2, Mail, Phone, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PayslipGenerator = () => {
    const payslipRef = useRef();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Company Details (Static)
    const companyDetails = {
        name: "INSANSA TECHNOLOGIES",
        address: "123 Tech Park, Electronic City Phase 1",
        city: "Bangalore, Karnataka - 560100",
        gst: "29AABCI1234R1Z5",
        phone: "+91 80 1234 5678",
        email: "hr@insansa.com",
        website: "www.insansa.com",
        cin: "U72200KA2020PTC123456"
    };

    const [employeeData, setEmployeeData] = useState({
        name: '',
        employeeId: '',
        department: '',
        designation: '',
        month: '',
        year: '',
        basicSalary: '',
        hra: '',
        conveyanceAllowance: '',
        medicalAllowance: '',
        specialAllowance: '',
        bankAccount: '',
        panNumber: '',
        uanNumber: '',
    });

    const [showPayslip, setShowPayslip] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculateDeductions = () => {
        const basicSalary = parseFloat(employeeData.basicSalary) || 0;
        const pf = basicSalary * 0.12;
        const professionalTax = 200;
        const incomeTax = basicSalary * 0.1;
        return { pf, professionalTax, incomeTax };
    };

    const calculateTotalEarnings = () => {
        return (
            (parseFloat(employeeData.basicSalary) || 0) +
            (parseFloat(employeeData.hra) || 0) +
            (parseFloat(employeeData.conveyanceAllowance) || 0) +
            (parseFloat(employeeData.medicalAllowance) || 0) +
            (parseFloat(employeeData.specialAllowance) || 0)
        );
    };

    const calculateNetSalary = () => {
        const totalEarnings = calculateTotalEarnings();
        const { pf, professionalTax, incomeTax } = calculateDeductions();
        return totalEarnings - (pf + professionalTax + incomeTax);
    };

    const handleGeneratePayslip = (e) => {
        e.preventDefault();
        setShowPayslip(true);
    };

    const handleReset = () => {
        setEmployeeData({
            name: '',
            employeeId: '',
            department: '',
            designation: '',
            month: '',
            year: '',
            basicSalary: '',
            hra: '',
            conveyanceAllowance: '',
            medicalAllowance: '',
            specialAllowance: '',
            bankAccount: '',
            panNumber: '',
            uanNumber: '',
        });
        setShowPayslip(false);
    };

    const generatePDF = async () => {
        if (!payslipRef.current) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(payslipRef.current, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgWidth = 208; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pdf = new jsPDF('p', 'mm', 'a4');

            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            );

            pdf.save(`payslip-${employeeData.name}-${employeeData.month}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-indigo-600">Employee Payslip Generator</h2>
                    <div className="text-right">
                        <Building2 className="inline-block mb-2" size={24} />
                        <p className="font-bold text-gray-800">{companyDetails.name}</p>
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
                            { label: 'Basic Salary', name: 'basicSalary', type: 'number' },
                            { label: 'HRA', name: 'hra', type: 'number' },
                            { label: 'Conveyance Allowance', name: 'conveyanceAllowance', type: 'number' },
                            { label: 'Medical Allowance', name: 'medicalAllowance', type: 'number' },
                            { label: 'Special Allowance', name: 'specialAllowance', type: 'number' },
                        ].map(({ label, name, type = 'text' }) => (
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
                                    required
                                    className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4">
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

            {showPayslip && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={generatePDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={20} />
                            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                        </button>
                    </div>

                    <div ref={payslipRef} className="bg-white shadow-md rounded-lg p-6 mt-6">
                        <div className="border-b pb-6 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-indigo-600 mb-2">{companyDetails.name}</h1>
                                    <p className="text-gray-600">{companyDetails.address}</p>
                                    <p className="text-gray-600">{companyDetails.city}</p>
                                    <div className="mt-2 text-sm">
                                        <p><span className="font-medium">GST:</span> {companyDetails.gst}</p>
                                        <p><span className="font-medium">CIN:</span> {companyDetails.cin}</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="flex items-center justify-end gap-2">
                                        <Phone size={16} />
                                        {companyDetails.phone}
                                    </p>
                                    <p className="flex items-center justify-end gap-2">
                                        <Mail size={16} />
                                        {companyDetails.email}
                                    </p>
                                    <p className="text-gray-600">{companyDetails.website}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3">Employee Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium">Name:</p>
                                            <p>{employeeData.name}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Employee ID:</p>
                                            <p>{employeeData.employeeId}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Department:</p>
                                            <p>{employeeData.department}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Designation:</p>
                                            <p>{employeeData.designation}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">PAN:</p>
                                            <p>{employeeData.panNumber}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">UAN:</p>
                                            <p>{employeeData.uanNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Bank Account:</span> {employeeData.bankAccount}</p>
                                        <p><span className="font-medium">Payment Month:</span> {employeeData.month}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Earnings</h3>
                                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                        {[
                                            { label: 'Basic Salary', key: 'basicSalary' },
                                            { label: 'HRA', key: 'hra' },
                                            { label: 'Conveyance Allowance', key: 'conveyanceAllowance' },
                                            { label: 'Medical Allowance', key: 'medicalAllowance' },
                                            { label: 'Special Allowance', key: 'specialAllowance' },
                                        ].map(({ label, key }) => (
                                            <div key={key} className="flex justify-between">
                                                <span>{label}</span>
                                                <span>₹{parseFloat(employeeData[key] || 0).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-2 mt-2 font-semibold">
                                            <div className="flex justify-between">
                                                <span>Total Earnings</span>
                                                <span>₹{calculateTotalEarnings().toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Deductions</h3>
                                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                        {Object.entries(calculateDeductions()).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                                                <span>₹{value.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-2 mt-2 font-semibold">
                                            <div className="flex justify-between">
                                                <span>Total Deductions</span>
                                                <span>₹{Object.values(calculateDeductions())
                                                    .reduce((acc, cur) => acc + cur, 0)
                                                    .toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold">Net Salary</span>
                                    <span className="text-xl font-bold">₹{calculateNetSalary().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PayslipGenerator;