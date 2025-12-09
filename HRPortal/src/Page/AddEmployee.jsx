import React, { useState } from 'react';
import axios from 'axios';
import {
    User,
    Mail,
    Building2,
    Save,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import API_BASE_URL from '../config';
import ErrorToast from '../Components/Toaster/ErrorToaster';
import SuccessToast from '../Components/Toaster/SuccessToaser';
import { DEPARTMENTS } from '../Constant/constant';


const AddEmployeePage = () => {
    // Form state
    const [employeeData, setEmployeeData] = useState({
        name: '',
        email: '',
        department: ''
    });

    // Submission state
    const [submitStatus, setSubmitStatus] = useState({
        loading: false,
        success: false,
        error: null
    });
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
    const [toastErrorMessage, setToastErrorMessage] = useState();
    const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
    const [toastErrorVisible, setToastErrorVisible] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Form validation
    const validateForm = () => {
        const { name, email, department } = employeeData;
        return name.trim() !== '' &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            department.trim() !== '';
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset previous submission status
        setSubmitStatus({ loading: true, success: false, error: null });

        try {
            // Submit to backend
            const response = await axios.post(
                `${API_BASE_URL}/api/employee/add`,
                employeeData
            );

            if (response.status === 201) {
                setToastSuccessMessage(response.data.message);
                setToastSuccessVisible(true);
                setTimeout(() => setToastSuccessVisible(false), 3500);

                // Success handling
                setSubmitStatus({
                    loading: false,
                    success: true,
                    error: null
                });

                // Optional: Reset form after successful submission
                setEmployeeData({
                    name: '',
                    email: '',
                    department: ''
                });
            }
            else if (response.status === 202) {
                setToastErrorMessage(response.data.message);
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
            }
            else {
                // Success handling
                setSubmitStatus({
                    loading: false,
                    success: true,
                    error: null
                });

                // Optional: Reset form after successful submission
                setEmployeeData({
                    name: '',
                    email: '',
                    department: ''
                });
            }
        } catch (error) {
            // Error handling
            console.log("TTT");
            setToastErrorMessage(response.data.message);
            setToastErrorVisible(true);
            setTimeout(() => setToastErrorVisible(false), 3500);
            // setSubmitStatus({
            //     loading: false,
            //     success: false,
            //     error: error.response?.data?.message || 'An error occurred'
            // });
        }
    };

    return (
        <>
            {
                toastSuccessVisible ? <SuccessToast message={toastSuccessMessage} /> : null
            }
            {
                toastErrorVisible ? <ErrorToast error={toastErrorMessage} /> : null
            }
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white shadow-md rounded-xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                            <User className="mr-3 text-blue-600" />
                            Add New Employee
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Enter employee details to create a new profile
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={employeeData.name}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={employeeData.email}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                    placeholder="john.doe@company.com"
                                />
                            </div>
                        </div>

                        {/* Department Input */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="text-gray-400" size={20} />
                                </div>
                                <select
                                    id="department"
                                    name="department"
                                    value={employeeData.department}
                                    onChange={handleChange}
                                    required
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                >
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submission Status */}
                        {submitStatus.error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative flex items-center">
                                <AlertCircle className="mr-2 text-red-500" />
                                {submitStatus.error}
                            </div>
                        )}

                        {submitStatus.success && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative flex items-center">
                                <CheckCircle2 className="mr-2 text-green-500" />
                                Employee added successfully!
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={!validateForm() || submitStatus.loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${validateForm() && !submitStatus.loading
                                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        : 'bg-blue-300 cursor-not-allowed'
                                    }`}
                            >
                                {submitStatus.loading ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <Save className="mr-2" />
                                        Add Employee
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddEmployeePage;