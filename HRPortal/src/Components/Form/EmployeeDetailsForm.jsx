import React, { useState, useContext, useEffect } from "react";
import { userContext } from "../../Context/userContext";
import axios from 'axios';
import API_BASE_URL from "../../config.js";
import Loader from "../Loader/Loader.jsx";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Calendar, CloudUpload, Flag, IndianRupee, Mail, MapPinCheck, Phone, User, Building2, Briefcase, Save, ChevronDown, Gem, House, HousePlus, Loader2 } from "lucide-react";
import { Button } from '../ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx";
import { toast } from "../../hooks/useToast.js";
import { DEPARTMENT_HIERARCHY } from "../../Constant/constant.js";

function EmployeeDetailsForm(props) {
    const { user } = useContext(userContext);

    const Name = user?.userName; // fetching the name of user
    const [loading, setLoading] = useState(false);

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

    const departments = Object.keys(DEPARTMENT_HIERARCHY);

    const handleDepartmentChange = (value) => {
        const updatedEmployee = { ...newEmployee, department: value, designation: "" };
        setNewEmployee(updatedEmployee);
        localStorage.setItem("employeeDetails", JSON.stringify(updatedEmployee));
    };

    useEffect(() => {
        const storedData = localStorage.getItem("employeeDetails");
        if (storedData) {
            setNewEmployee(JSON.parse(storedData));
        }
    }, []);

    const handleInputChange = (field, value) => {
        const updatedEmployee = { ...newEmployee, [field]: value };
        setNewEmployee(updatedEmployee);
        localStorage.setItem("employeeDetails", JSON.stringify(updatedEmployee));
    };


    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);
            setEmployees((prev) => [...prev, { ...newEmployee, id: Date.now() }]);

            // Validate required document uploads (PAN and Aadhar) before submitting; the file inputs are hidden
            if (!newEmployee.documentsPanCard || !newEmployee.documentsAadhar) {
                toast({
                    variant: "destructive",
                    title: "Uploading Failed",
                    description: "Please upload both PAN Card and Aadhar Card documents.",
                });
                setLoading(false);
                return;
            }

            // Look up employee by the email entered in the form to avoid overwriting admin's record
            const empResponse = await axios.get(`${API_BASE_URL}/api/employee/fetchEmployeeByEmail/${newEmployee.email}`);

            if (empResponse.status === 200) {
                const formData = new FormData();
                // Backend reads email from newEmployee payload; no need to send empEmail separately
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

                if (response.status === 200) {
                    // alert("Details uploaded!");
                    if (props.setEmployee) {
                        props.setEmployee(response.data.updatedEmp);
                    }
                    setLoading(false);
                    localStorage.removeItem("employeeDetails");
                    toast({
                        variant: "success",
                        title: "Uploaded successfully",
                        description: "Employee Details Uploaded Successfully",
                    });
                }

                if (response.status === 401) {
                    toast({
                        variant: "error",
                        title: "Uploading Failed",
                        description: response.data.message || "Employee details already exists",
                    });
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
        } catch (error) {
            console.error("Error submitting employee details:", error);
            setLoading(false);
            toast({
                variant: "destructive",
                title: "Uploading Failed",
                description: error.response?.data?.message || "An error occurred while submitting employee details",
            });
        }
        finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
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

    { loading && <Loader /> }
    return (
        <>
            <div className="min-h-screen bg-background p-4 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold">Employee Registration</h1>
                        <p className="text-muted-foreground">Register employee details</p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Personal Information */}
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Full Name *</Label>
                                        <Input type="text" placeholder="Enter full name" value={newEmployee.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="email" placeholder="Enter Email" className="pl-10" value={newEmployee.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="number" placeholder="Enter Number" className="pl-10" value={newEmployee.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date Of Birth</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="date" className="pl-10" value={newEmployee.dateOfBirth}
                                                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Gender *</Label>

                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                            <Select
                                                value={newEmployee.gender}
                                                onValueChange={(value) =>
                                                    handleInputChange("gender", value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className="flex h-10 w-full px-3 pl-10 pr-8"
                                                >
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Others">Others</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Marital Status *</Label>

                                        <div className="relative">
                                            <Gem className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                            <Select
                                                value={newEmployee.maritalStatus}
                                                onValueChange={(value) =>
                                                    handleInputChange("maritalStatus", value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className="flex h-10 w-full px-3 pl-10 pr-8"
                                                >
                                                    <SelectValue placeholder="Select Marital Status" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="Single">Single</SelectItem>
                                                    <SelectItem value="Married">Married</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>

                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Nationality</Label>
                                        <div className="relative">
                                            <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="text" placeholder="eg. indian" className="pl-10" value={newEmployee.nationality}
                                                onChange={(e) => handleInputChange("nationality", e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Details */}
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPinCheck className="w-5 h-5 text-primary" />
                                    Address Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Current Address *</Label>
                                        <div className="relative">
                                            <HousePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="text" placeholder="Enter current address" className="pl-10" value={newEmployee.currentAddress}
                                                onChange={(e) => handleInputChange("currentAddress", e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Permanent Address *</Label>
                                        <div className="relative">
                                            <House className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="text" placeholder="Enter permanent address" className="pl-10" value={newEmployee.permanentAddress}
                                                onChange={(e) => handleInputChange("permanentAddress", e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>City *</Label>
                                        <div className="relative">
                                            <Input type="text" placeholder="Enter City" value={newEmployee.city}
                                                onChange={(e) => handleInputChange("city", e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input type="text" placeholder="Enter State" value={newEmployee.state}
                                            onChange={(e) => handleInputChange("state", e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Pincode *</Label>
                                        <div className="relative">
                                            <Input type="number" placeholder="Enter Pincode" value={newEmployee.pincode}
                                                onChange={(e) => handleInputChange("pincode", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment Details */}
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Employment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Department *</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Select
                                                value={newEmployee.department || ""}
                                                onValueChange={handleDepartmentChange}
                                            >
                                                <SelectTrigger
                                                    className="flex h-10 w-full px-3 pl-10 pr-8"
                                                >
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {(departments ?? []).map((dept) => (
                                                        <SelectItem key={dept} value={dept}>
                                                            {dept}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Date Of Joining</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input type="date" className="pl-10" value={newEmployee.dateOfJoining}
                                                onChange={(e) => handleInputChange("dateOfJoining", e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Designation *</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Select
                                                value={newEmployee.designation || ""}
                                                onValueChange={(value) => handleInputChange("designation", value)}
                                                disabled={!newEmployee.department}
                                            >
                                                <SelectTrigger className="flex h-10 w-full px-3 pl-10 pr-8">
                                                    <SelectValue placeholder={newEmployee.department ? "Select Designation" : "Select Department first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {newEmployee.department && DEPARTMENT_HIERARCHY[newEmployee.department]?.map((desig) => (
                                                        <SelectItem key={desig} value={desig}>
                                                            {desig}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Salary Information */}
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-primary" />
                                    Financial Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Name as per Bank Account *</Label>
                                        <Input type="text" placeholder="Enter Name" value={newEmployee.nameAsPerBank}
                                            onChange={(e) => handleInputChange("nameAsPerBank", e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bank Name *</Label>
                                        <Input type="text" placeholder="Enter Bank Name" value={newEmployee.bankName}
                                            onChange={(e) => handleInputChange("bankName", e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Account Number *</Label>
                                        <Input type="text" placeholder="Enter Account Number" value={newEmployee.accountNumber}
                                            onChange={(e) => handleInputChange("accountNumber", e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IFSC Code *</Label>
                                        <Input type="text" placeholder="Enter Code" value={newEmployee.ifscCode}
                                            onChange={(e) => handleInputChange("ifscCode", e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>PAN Number *</Label>
                                        <Input type="text" placeholder="Enter PAN Number" value={newEmployee.panNumber}
                                            onChange={(e) => handleInputChange("panNumber", e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aadhar Number *</Label>
                                        <Input type="text" placeholder="Enter Aadhar Number" value={newEmployee.aadharNumber}
                                            onChange={(e) => handleInputChange("aadharNumber", e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>UAN Number *</Label>
                                        <Input type="text" placeholder="Enter UAN Number" value={newEmployee.uanNumber}
                                            onChange={(e) => handleInputChange("uanNumber", e.target.value)} required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-primary" />
                                    Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Emergency Contact Name *</Label>
                                        <Input type="text" placeholder="Enter Name" value={newEmployee.emergencyContactName}
                                            onChange={(e) =>
                                                handleInputChange("emergencyContactName", e.target.value)
                                            } required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Emergency Contact Relation *</Label>
                                        <Input type="text" placeholder="Enter Relation" value={newEmployee.emergencyContactRelation}
                                            onChange={(e) =>
                                                handleInputChange("emergencyContactRelation", e.target.value)
                                            } required />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Emergency Contact Phone *</Label>
                                        <Input type="number" placeholder="Enter Number" value={newEmployee.emergencyContactPhone}
                                            onChange={(e) =>
                                                handleInputChange("emergencyContactPhone", e.target.value)
                                            } required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Document Upload */}
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CloudUpload className="w-5 h-5 text-primary" />
                                    Document Upload
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label> PAN Card *</Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="documentsPanCard" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
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
                                    <div className="space-y-2">
                                        <Label>Aadhar Card* </Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="documentsAadhar" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
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
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Degree Certificate</Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="documentsDegree" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
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
                                    <div className="space-y-2">
                                        <Label>Experience Certificate</Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="documentsExperience" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
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
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-3 mt-5">
                            <Button
                                type="submit"
                                className="gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Register Employee
                                    </>
                                )}
                            </Button>

                            <Button variant="outline" disabled={loading} onClick={handleCancel}>Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EmployeeDetailsForm
