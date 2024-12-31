import React, { useState, useContext } from "react";
import { userContext } from "../../Context/userContext";
import axios from 'axios';
import API_BASE_URL from "../../config.js";

function EmployeeDetailsForm(props) {

    const { user } = useContext(userContext);

    const Name = user?.userName; // fetching the name of user


    const [employees, setEmployees] = useState([]);
    const [file, setFile] = useState();
    // const [file, setFile] = useState();
    const [newEmployee, setNewEmployee] = useState({
        name: "",
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
        nameAsPerBank: "",
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
        console.log(field, value)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmployees((prev) => [...prev, { ...newEmployee, id: Date.now() }]);

        console.log(newEmployee);

        const empResponse = await axios.get(`${API_BASE_URL}/api/employee/fetchEmployeeByEmail/${user.userEmail}`);

        if (empResponse.status === 201) {
            const empEmail = empResponse.data.email;
            console.log(empResponse.data.email);

            const formData = new FormData();
            formData.append("empEmail", empEmail);
            formData.append("newEmployee", JSON.stringify(newEmployee));
            if (newEmployee.documentsPanCard) {
                formData.append("documentsPanCard", newEmployee.documentsPanCard);
            }
            if (newEmployee.documentsAadhar) {
                formData.append("documentsAadhar", newEmployee.documentsAadhar);
            }
            if (newEmployee.documentsDegree) {
                formData.append("documentsDegree", newEmployee.documentsDegree);
            }
            if (newEmployee.documentsExperience) {
                formData.append("documentsExperience", newEmployee.documentsExperience);
            }

            const response = await axios.post(`${API_BASE_URL}/api/employee/uploadDetails`,
                formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                console.log(response.data.updatedEmp);
                alert("Details uploaded!");

                props.setEmployee(newEmployee);
                window.location.reload();
            }


            setNewEmployee({
                name: "",
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
                nameAsPerBank: "",
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
        }
    };

    const fileChangeHandler = (field, event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file)
            handleInputChange(field, file);
        }
    }

    const handleDrop = (field, event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setFile(file);
            handleInputChange(field, file);
        }
    };

    const handleDragOver = (field, event) => {
        event.preventDefault();
    };

    return (
        <div>
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
                                type="number"
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
                                type="number"
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
                                Name as per Bank Account*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.nameAsPerBank}
                                onChange={(e) => handleInputChange("nameAsPerBank", e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
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
                                value={newEmployee.emergencyContactName}
                                onChange={(e) =>
                                    handleInputChange("emergencyContactName", e.target.value)
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Emergency Contact Relation*
                            </label>
                            <input
                                type="text"
                                value={newEmployee.emergencyContactRelation}
                                onChange={(e) =>
                                    handleInputChange("emergencyContactRelation", e.target.value)
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Emergency Contact Phone*
                            </label>
                            <input
                                type="number"
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
                            <div className="flex items-center justify-center w-full">
                                <label forName="documentsPanCard" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
                                    onDrop={(e) => handleDrop("documentsPanCard", e)}
                                    onDragOver={(e) => handleDragOver("documentsPanCard", e)}>
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        {newEmployee && newEmployee.documentsPanCard ?
                                            (
                                                <p className="ml-3 text-sm text-gray-500">
                                                    Selected file: <span className="font-medium">{newEmployee.documentsPanCard.name}</span>
                                                </p>
                                            )
                                            :
                                            (<p className="ml-3 text-sm text-gray-500 "><span className="font-semibold">Click to upload</span> or drag and drop</p>)
                                        }
                                    </div>
                                    <input id="documentsPanCard" type="file" className="hidden" onChange={(e) => fileChangeHandler("documentsPanCard", e)} />
                                </label>

                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Aadhar Card*
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label forName="documentsAadhar" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
                                    onDrop={(e) => handleDrop("documentsAadhar", e)}
                                    onDragOver={(e) => handleDragOver("documentsAadhar", e)}>
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        {newEmployee.documentsAadhar ?
                                            (
                                                <p className="ml-3 text-sm text-gray-500">
                                                    Selected file: <span className="font-medium">{newEmployee.documentsAadhar.name}</span>
                                                </p>
                                            )
                                            :
                                            (<p className="ml-3 text-sm text-gray-500 "><span className="font-semibold">Click to upload</span> or drag and drop</p>)
                                        }
                                    </div>
                                    <input id="documentsAadhar" type="file" className="hidden" onChange={(e) => fileChangeHandler("documentsAadhar", e)} />
                                </label>

                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Degree Certificate
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label forName="documentsDegree" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
                                    onDrop={(e) => handleDrop("documentsDegree", e)}
                                    onDragOver={(e) => handleDragOver("documentsDegree", e)}>
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        {newEmployee.documentsDegree ?
                                            (
                                                <p className="ml-3 text-sm text-gray-500">
                                                    Selected file: <span className="font-medium">{newEmployee.documentsDegree.name}</span>
                                                </p>
                                            )
                                            :
                                            (<p className="ml-3 text-sm text-gray-500 "><span className="font-semibold">Click to upload</span> or drag and drop</p>)
                                        }
                                    </div>
                                    <input id="documentsDegree" type="file" className="hidden" onChange={(e) => fileChangeHandler("documentsDegree", e)} />
                                </label>

                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Experience Certificate
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label forName="documentsExperience" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
                                    onDrop={(e) => handleDrop("documentsExperience", e)}
                                    onDragOver={(e) => handleDragOver("documentsExperience", e)}>
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        {newEmployee.documentsExperience ?
                                            (
                                                <p className="ml-3 text-sm text-gray-500">
                                                    Selected file: <span className="font-medium">{newEmployee.documentsExperience.name}</span>
                                                </p>
                                            )
                                            :
                                            (<p className="ml-3 text-sm text-gray-500 "><span className="font-semibold">Click to upload</span> or drag and drop</p>)
                                        }
                                    </div>
                                    <input id="documentsExperience" type="file" className="hidden" onChange={(e) => fileChangeHandler("documentsExperience", e)} />
                                </label>

                            </div>
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
    )
}

export default EmployeeDetailsForm