import React, { useContext, useEffect, useState } from 'react';
import { Search, Download, ChevronDown, User } from 'lucide-react';
import { userContext } from '../Context/userContext';
import API_BASE_URL from '../config';
import axios from 'axios';
import Loader from '../Components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import ErrorToast from '../Components/Toaster/ErrorToaster';

const PayslipTracker = () => {
    const [userRole, setUserRole] = useState('employee'); // 'employee' or 'accountant'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [error, setError] = useState(null);
    const {user} = useContext(userContext);
    const [payslips, setPayslips] = useState();
    const [loading, setLoading] = useState(true);
    const [noEmployeeDetail, setNoEmployeeDetail] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayslips = async () => {
            
            if(user && user.role ==='superAdmin' || user.role ==='accountant' || user.role ==='admin'){
                const response = await axios.get(`${API_BASE_URL}/api/payslip/`);
                console.log(response)
                if (response.status === 200){
                    const allPayslips = response.data.paySlips;
                    setPayslips(allPayslips);
                }
                 
            }
            else if(user && user.role === 'employee'){
                console.log("In Employee Role..");

                // const fetchedemp = await axios.get(`${API_BASE_URL}/api/employee/fetchEmployeeByEmail/${user.userEmail}`);

                // const eid = fetchedemp.data.empId;

                // if(!fetchedemp){
                //     <ErrorToast message=""/>
                // }
                const response = await axios.get(`${API_BASE_URL}/api/payslip/my-payslip/${user.userEmail}`);
                if (response.status === 200) {
                    const employeePayslip = response.data.payslips;

                    console.log("EMP PAYSLIPS:",employeePayslip);
                    setPayslips(employeePayslip);
                console.log("Employee Payslip Data on frontend: ", employeePayslip);
                }   
                else{
                    setPayslips(null);
                    <ErrorToast message="No Payslips Found"/>
                    console.log("No Payslip from response");
                }
            }
            else{
                const empResponse = await axios.get(`${API_BASE_URL}/api/employee/fetchEmployeeByEmail/${user.userEmail}`);
                if(empResponse.status===200){
    
                    const employee = empResponse.data;

                    if(!employee.details){
                        setLoading(false);
                        setNoEmployeeDetail(true);
                    }
                    else{
                        const response = await axios.get(`${API_BASE_URL}/api/payslip/fetchByEmployeeId/${employee.details.employeeDetailId}`);
                        if(response.status===201){
                            const filteredPayslips = response.data.paySlips;
                            setPayslips(filteredPayslips);    
                        }
                    }

                }
            } 
            setLoading(false);
        }

        fetchPayslips();
    }, []);

    const filteredPayslips = payslips && payslips.filter((payslip) => {
        const matchesSearch = payslip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
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
                        user && (user.role==="user" || user.role ==="admin" || user.role === "employee")
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
                                <tr key={payslip.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payslip.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payslip.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payslip.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payslip.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.salary.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.totalEarnings.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{payslip.totalDeductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">₹{payslip.netSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            paid
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:cursor-not-allowed">
                                            <Download className="h-5 w-5 text-blue-500" />
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
    );
};

export default PayslipTracker;
