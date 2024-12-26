import React, { useState, useContext } from "react";
import { userContext } from "../Context/userContext";


const EmployeeManagementForm = () => {
    const { user } = useContext(userContext);

    const Name = user?.userName; // fetching the name of user


    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: "",
        employeeId: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        nationality: "",
        currentAddress: "",
        permanentAddress: "",
        city: "",
        state: "",
        pincode: "",
        dateOfJoining: "",
        department: "",
        designation: "",
        reportingManager: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        panNumber: "",
        aadharNumber: "",
        uanNumber: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
        documentsPanCard: "",
        documentsAadhar: "",
        documentsDegree: "",
        documentsExperience: "",
    });

    const departments = ["Engineering", "Product", "Sales", "Marketing", "HR"];

    const handleInputChange = (field, value) => {
        setNewEmployee((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setEmployees((prev) => [...prev, { ...newEmployee, id: Date.now() }]);
        setNewEmployee({
            name: "",
            employeeId: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            gender: "",
            maritalStatus: "",
            nationality: "",
            currentAddress: "",
            permanentAddress: "",
            city: "",
            state: "",
            pincode: "",
            dateOfJoining: "",
            department: "",
            designation: "",
            reportingManager: "",
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            panNumber: "",
            aadharNumber: "",
            uanNumber: "",
            emergencyContactName: "",
            emergencyContactRelation: "",
            emergencyContactPhone: "",
            documentsPanCard: "",
            documentsAadhar: "",
            documentsDegree: "",
            documentsExperience: "",
        });
    };

    const removeEmployee = (id) => {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white rounded-lg shadow-lg overflow-hidden p-8">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        Welcome, <span className="capitalize">{Name}</span>!
                    </h1>
                    <p className="text-lg md:text-xl font-medium">
                        Please share your details to get started.
                    </p>
                </div>
            </div>




            <form
                onSubmit={handleSubmit}
                className="space-y-8 bg-gray-100 p-8 rounded-lg shadow-lg"
            >
                {/* Personal Information */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b pb-3">
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Full Name*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Employee ID*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.employeeId}
                                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email*
                            </label>
                            <input
                                type="email"
                                value={newEmployee.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Phone*
                            </label>
                            <input
                                type="tel"
                                value={newEmployee.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date of Birth*
                            </label>
                            <input
                                type="date"
                                value={newEmployee.dateOfBirth}
                                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Gender*
                            </label>
                            <select
                                value={newEmployee.gender}
                                onChange={(e) => handleInputChange("gender", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Marital Status*
                            </label>
                            <select
                                value={newEmployee.maritalStatus}
                                onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nationality*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.nationality}
                                onChange={(e) => handleInputChange("nationality", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b pb-3">
                        Address Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Current Address*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.currentAddress}
                                onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Permanent Address*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.permanentAddress}
                                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                City*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                State*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.state}
                                onChange={(e) => handleInputChange("state", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Pincode*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.pincode}
                                onChange={(e) => handleInputChange("pincode", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b pb-3">
                        Employment Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date of Joining*
                            </label>
                            <input
                                type="date"
                                value={newEmployee.dateOfJoining}
                                onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Department*
                            </label>
                            <select
                                value={newEmployee.department}
                                onChange={(e) => handleInputChange("department", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Designation*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.designation}
                                onChange={(e) => handleInputChange("designation", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Reporting Manager*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.reportingManager}
                                onChange={(e) => handleInputChange("reportingManager", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b pb-3">
                        Financial Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Bank Name*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.bankName}
                                onChange={(e) => handleInputChange("bankName", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Account Number*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.accountNumber}
                                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                IFSC Code*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.ifscCode}
                                onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                PAN Number*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.panNumber}
                                onChange={(e) => handleInputChange("panNumber", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Aadhar Number*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.aadharNumber}
                                onChange={(e) => handleInputChange("aadharNumber", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                UAN Number
                            </label>
                            <input
                                type="text"
                                value={newEmployee.uanNumber}
                                onChange={(e) => handleInputChange("uanNumber", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b pb-3">
                        Emergency Contact
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Emergency Contact Name*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.emergencyContactPhone}
                                onChange={(e) =>
                                    handleInputChange("emergencyContactPhone", e.target.value)
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-blue-600 border-b pb-3">
                        Document Upload
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                PAN Card*
                            </label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    handleInputChange("documentsPanCard", e.target.files[0])
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Aadhar Card*
                            </label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    handleInputChange("documentsAadhar", e.target.files[0])
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Degree Certificate
                            </label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    handleInputChange("documentsDegree", e.target.files[0])
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Experience Certificate
                            </label>
                            <input
                                type="file"
                                onChange={(e) =>
                                    handleInputChange("documentsExperience", e.target.files[0])
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Submit Employee Details
                </button>
            </form>

        </div>
    );
};

export default EmployeeManagementForm;
