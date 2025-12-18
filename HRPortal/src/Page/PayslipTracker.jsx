import React, { useContext, useEffect, useState, useRef } from 'react';
import { Search, Download, ChevronDown, User } from 'lucide-react';
import { userContext } from '../Context/userContext';
import API_BASE_URL from '../config';
import axios from 'axios';
import Loader from '../Components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import ErrorToast from '../Components/Toaster/ErrorToaster';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PayslipTracker = () => {
    const [userRole, setUserRole] = useState('employee'); // 'employee' or 'accountant'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [error, setError] = useState(null);
    const {user} = useContext(userContext);
    const [payslips, setPayslips] = useState();
    const [loading, setLoading] = useState(true);
    const [noEmployeeDetail, setNoEmployeeDetail] = useState(false);
    const [downloading, setDownloading] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [activePayslip, setActivePayslip] = useState(null);
    const navigate = useNavigate();
    const payslipRef = useRef(null);

    const handleDownloadPayslip = async (payslipId) => {
        setDownloading(payslipId);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/payslip/${payslipId}`);
            if (response.status === 200) {
                const fullPayslip = response.data.payslip;
                setActivePayslip(fullPayslip);
                // Wait for the hidden template to render before capturing
                await new Promise((resolve) => requestAnimationFrame(resolve));
                await generatePDF(fullPayslip);
            }
        } catch (error) {
            console.error('Error downloading payslip:', error);
            setError('Failed to download payslip');
        } finally {
            setActivePayslip(null);
            setDownloading(null);
        }
    };

    const generatePDF = async (payslipData) => {
        if (!payslipRef.current) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(payslipRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
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

            pdf.save(`payslip-${payslipData.name}-${payslipData.month}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchPayslips = async () => {
            try {
                const commonParams = { fields: "_id,employeeId,name,department,month,salary,totalEarnings,totalDeductions,netSalary", limit: 200 };

                if (user && (user.role === 'superAdmin' || user.role === 'accountant' || user.role === 'admin')) {
                    const response = await axios.get(`${API_BASE_URL}/api/payslip/`, {
                        params: { ...commonParams, month: filterMonth || undefined },
                        signal,
                    });
                    if (response.status === 200) {
                        setPayslips(response.data.paySlips);
                    }
                } else if (user && (user.role === "user" || user.role === "employee")) {
                    const response = await axios.get(`${API_BASE_URL}/api/payslip/my-payslip/${user.userEmail}`, {
                        params: { month: filterMonth || undefined, limit: 200 },
                        signal,
                    });
                    if (response.status === 200) {
                        setPayslips(response.data.payslips || []);
                    } else {
                        setPayslips([]);
                    }
                }
            } catch (error) {
                if (axios.isCancel?.(error)) return;
                console.error("Error fetching payslips:", error);
                setPayslips([]);
                setError(error.response?.data?.message || "Failed to fetch payslips");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchPayslips();
        return () => controller.abort();
    }, [user, filterMonth]);

    const filteredPayslips = payslips && payslips.filter((payslip) => {
        const nameStr = payslip.name?.toLowerCase?.() || "";
        const idStr = payslip.employeeId?.toLowerCase?.() || "";
        const matchesSearch = nameStr.includes(searchTerm.toLowerCase()) || idStr.includes(searchTerm.toLowerCase());
        const matchesMonth = filterMonth ? payslip.month === filterMonth : true;
        return matchesSearch && matchesMonth;
    });

    if(loading){
        return(
            <Loader/>
        )
    }

    if(noEmployeeDetail){
        return(
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-6 text-gray-800 text-xl font-semibold">
                        Please register yourself through Employee Registration form
                    </div>
                    <button
                        onClick={() => navigate('/emp-info')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Register Yourself
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
        <div className="max-w-7xl mx-auto p-6 space-y-6 bg-white text-black">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-500">Payslip Manager</h1>
                    <p className="text-gray-500">
                        {userRole === 'accountant' ? 'Manage all employee payslips' : 'View your payslip history'}
                    </p>
                </div>
                
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                <div className="flex-1 min-w-[200px]">
                    {
                        user && (user.role==="user" || user.role === "employee")
                        ?
                        null
                        : 
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    }
                </div>

                <div className="flex gap-4">
                    {/* Month Select */}
                        <input 
                        className='flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-blue-500'
                        type='month'
                        onChange={(e) => {setFilterMonth(e.target.value)}}></input>

                </div>
            </div>

            {/* Payslips Table */}
            <div className="bg-white rounded-lg shadow overflow-auto max-h-96">
                {error && (
                    <div className="text-red-500 text-center py-4">
                        {error}
                    </div>
                )}
                {filteredPayslips && filteredPayslips.length === 0 ? (
                    <div className="text-gray-500 text-center py-6">
                        No payslips found. Please adjust your filters or try again.
                    </div>
                ) : (
                    <table className="min-w-full h-3/4 divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPayslips && filteredPayslips.map((payslip) => (
                                <tr key={payslip._id || payslip.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payslip.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payslip.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payslip.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payslip.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.salary?.toLocaleString?.() || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.totalEarnings?.toLocaleString?.() || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.totalDeductions?.toLocaleString?.() || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">₹{payslip.netSalary?.toLocaleString?.() || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            paid
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                        onClick={() => handleDownloadPayslip(payslip._id || payslip.id)}
                                        disabled={downloading === (payslip._id || payslip.id)}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-blue-100 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                            {downloading === (payslip._id || payslip.id) ? (
                                                <span className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <Download className="h-5 w-5 text-blue-500" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                                
                            ))}
                        </tbody>
                    </table>
                )}
                { !payslips && 
                            <div className='flex min-w-full items-center justify-center min-h-20 text-gray-400'>
                                <p>No Payslips Found</p>
                            </div>
                }
            </div>
        </div>


        {/* Hidden payslip template for PDF generation using html2canvas */}
        {activePayslip && (
            <div className="fixed -left-[9999px] top-0">
                <div ref={payslipRef} className="w-[794px] bg-white text-gray-900 p-10 space-y-8 shadow-lg">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-[#3554d1] uppercase tracking-wide">Insansa Technologies</h1>
                            <p className="text-sm text-gray-700 leading-5">
                                B/321 Monalisa Business Center Manjalpur<br />
                                Vadodara Gujarat INDIA 390011
                            </p>
                            <div className="text-sm text-gray-800 space-y-0.5">
                                <p><span className="font-semibold">GST:</span> <span className="text-gray-600">—</span></p>
                                <p><span className="font-semibold">CIN:</span> <span className="text-gray-600">—</span></p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-700 space-y-1">
                            <p className="flex items-center justify-end gap-2">📞 <span className="font-medium">+91 9724379123</span></p>
                            <p className="flex items-center justify-end gap-2">✉️ <span className="font-medium">talent@insansa.com</span></p>
                            <p className="flex items-center justify-end gap-2">🌐 <span className="font-medium">www.insansa.com</span></p>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Details Row */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800">Employee Details</h3>
                            <div className="grid grid-cols-2 gap-y-2">
                                <div>
                                    <p className="font-semibold text-gray-800">Name:</p>
                                    <p className="text-gray-700">{activePayslip.name || ""}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Employee ID:</p>
                                    <p className="text-gray-700">{activePayslip.employeeId || ""}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Department:</p>
                                    <p className="text-gray-700">{activePayslip.department || ""}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Designation:</p>
                                    <p className="text-gray-700">{activePayslip.designation || ""}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">PAN:</p>
                                    <p className="text-gray-700">{activePayslip.panNumber || ""}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">UAN:</p>
                                    <p className="text-gray-700">{activePayslip.uanNumber || ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-800">Bank Account:</p>
                                <p className="text-gray-700">{activePayslip.bankAccount || ""}</p>
                                <p className="font-semibold text-gray-800 mt-2">Payment Month:</p>
                                <p className="text-gray-700">{activePayslip.month || ""}</p>
                            </div>
                        </div>
                    </div>

                    {/* Earnings & Deductions */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white border rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 px-4 py-3">Earnings</h3>
                            <div className="border-t px-4 py-2 flex justify-between">
                                <span className="text-gray-800">Basic Salary</span>
                                <span className="text-gray-800">₹{activePayslip.salary?.toLocaleString?.() || "0.00"}</span>
                            </div>
                            {activePayslip.allowances && Object.entries(activePayslip.allowances).map(([key, value]) => (
                                <div key={key} className="border-t px-4 py-2 flex justify-between">
                                    <span className="text-gray-800">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-gray-800">₹{value?.toLocaleString?.() || "0.00"}</span>
                                </div>
                            ))}
                            <div className="border-t bg-gray-50 px-4 py-2 flex justify-between font-semibold">
                                <span>Total Earnings</span>
                                <span>₹{activePayslip.totalEarnings?.toLocaleString?.() || "0.00"}</span>
                            </div>
                        </div>

                        <div className="bg-white border rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 px-4 py-3">Deductions</h3>
                            {activePayslip.deductions && Object.entries(activePayslip.deductions).map(([key, value]) => (
                                <div key={key} className="border-t px-4 py-2 flex justify-between">
                                    <span className="text-gray-800">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-gray-800">₹{value?.toLocaleString?.() || "0.00"}</span>
                                </div>
                            ))}
                            <div className="border-t bg-gray-50 px-4 py-2 flex justify-between font-semibold">
                                <span>Total Deductions</span>
                                <span>₹{activePayslip.totalDeductions?.toLocaleString?.() || "0.00"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Salary */}
                    <div className="bg-[#e8edff] rounded-xl px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Net Salary</h3>
                        <p className="text-xl font-bold text-gray-900">₹{activePayslip.netSalary?.toLocaleString?.() || "0.00"}</p>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default PayslipTracker;
