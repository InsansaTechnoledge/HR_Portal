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

    useEffect(() => {

        const fetchEmployees = async () => {
            const response = await axios.get(`${API_BASE_URL}/api/employee/`);

            if(response.status===201){
                setEmployees(response.data.employees);
                setLoading(false);
            }
        }

        fetchEmployees();
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

    const [showPayslip, setShowPayslip] = useState(false);

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
                employeeId: selectedEmployee.details.employeeDetailId,
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
            // alert("employee detail not available");
            setToastErrorMessage("employee detail not available");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
        }
    };

    // const calculateDeductions = () => {
    //     const salary = parseFloat(employeeData.salary) || 0;
    //     const pf = salary * 0.12;
    //     const professionalTax = 200;
    //     const incomeTax = salary * 0.1;
    //     return { pf, professionalTax, incomeTax };
    // };
    const calculateDeductions = () => {
        const salary = parseFloat(employeeData.salary) || 0;
        const incomeTax = 0;
        if(taxType==='Professional Tax'){
            return { professionalTax };
        }
        else{
            return { TDS: salary * 0.1 };
        }
        // if(taxType==='Professional Tax'){
        //     return { professionalTax, incomeTax };
        // }
        // else{
        //     return { TDS: salary * 0.1, incomeTax };
        // }
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

    // const calculateNetSalary = () => {
    //     const totalEarnings = calculateTotalEarnings();
    //     const { pf, professionalTax, incomeTax } = calculateDeductions();
    //     return totalEarnings - (pf + professionalTax + incomeTax);
    // };

    const calculateNetSalary = () => {
        const totalEarnings = calculateTotalEarnings();
        if(taxType==="Professional Tax"){
            const { professionalTax, incomeTax } = calculateDeductions();
            // return totalEarnings - (professionalTax + incomeTax);
            return totalEarnings - (professionalTax);
        }
        else{
            const { TDS, incomeTax } = calculateDeductions();
            // return totalEarnings - (professionalTax + incomeTax);
            return totalEarnings - (TDS);

        }
    };

    const handleGeneratePayslip = async (e) => {
        e.preventDefault();
        setLoading(true);
        const taxName = document.querySelector('input[name="tax"]:checked');
        if (taxName) {
            setTaxType(taxName.value); // This will set the value of the selected radio button
        }

        setPayslip({
            name: employeeData.name,
            employeeId: employeeData.employeeId,
            department: employeeData.department,
            designation: employeeData.designation,
            month: employeeData.month,
            salary: employeeData.salary,
            hra: employeeData.hra,
            conveyanceAllowance: employeeData.conveyanceAllowance,
            medicalAllowance: employeeData.medicalAllowance,
            specialAllowance: employeeData.specialAllowance,
            bankAccount: employeeData.bankAccount,
            panNumber: employeeData.panNumber,
            uanNumber: employeeData.uanNumber,
            professionalTax: professionalTax,
            incomeTax: employeeData.salary * 0.1,
            totalEarnings: calculateTotalEarnings().toFixed(2),
            netSalary: calculateNetSalary().toFixed(2),
            totalDeductions: Object.values(calculateDeductions())
                .reduce((acc, cur) => acc + cur, 0)
                .toFixed(2),
            generatedBy: user.userName,
            taxType: taxName.value
            }
        );


        const response = await axios.post(`${API_BASE_URL}/api/payslip/generate`,{
            name: employeeData.name,
            employeeId: employeeData.employeeId,
            department: employeeData.department,
            designation: employeeData.designation,
            month: employeeData.month,
            salary: employeeData.salary,
            hra: employeeData.hra,
            conveyanceAllowance: employeeData.conveyanceAllowance,
            medicalAllowance: employeeData.medicalAllowance,
            specialAllowance: employeeData.specialAllowance,
            bankAccount: employeeData.bankAccount,
            panNumber: employeeData.panNumber,
            uanNumber: employeeData.uanNumber,
            professionalTax: professionalTax,
            incomeTax: employeeData.salary * 0.1,
            totalEarnings: calculateTotalEarnings().toFixed(2),
            netSalary: calculateNetSalary().toFixed(2),
            totalDeductions: Object.values(calculateDeductions())
                .reduce((acc, cur) => acc + cur, 0)
                .toFixed(2),
            generatedBy: user.userName,
            taxType: taxName.value
            },
        {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if(response.status===201){
            console.log("Payslip saved");
            setLoading(false);
        }

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
            salary: '',
            hra: 0,
            conveyanceAllowance: 0,
            medicalAllowance: 0,
            specialAllowance: 0,
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

    if(loading){
        return (
            <Loader/>
        )
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
                                            { label: 'Basic Salary', key: 'salary' },
                                            // { label: 'HRA', key: 'hra' },
                                            // { label: 'Conveyance Allowance', key: 'conveyanceAllowance' },
                                            // { label: 'Medical Allowance', key: 'medicalAllowance' },
                                            // { label: 'Special Allowance', key: 'specialAllowance' },
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
        </>
    );
};

export default PayslipGenerator;
