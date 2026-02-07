import React, { useState } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Save,
  ChevronDown,
} from 'lucide-react';
import API_BASE_URL from '../config';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { DEPARTMENTS } from '../Constant/constant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Components/ui/select';
import { toast } from '../hooks/useToast';


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

    //reset fields
    const handleCancel = () => {
        setEmployeeData({
            name: '',
            email: '',
            department: ''
        });
    }
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
                toast({
                  variant: "success",
                  title: "Employee added successfully",
                  description: "The new employee has been added to the system.",
                });

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
                toast({
                  variant: "destructive",
                  title: "Failed to add employee",
                description: response.data.message || "An error occurred while adding the employee.",
                });

                // Failure handling
                setSubmitStatus({
                    loading: false,
                    success: false,
                    error: response.data.message || 'An error occurred'
                });
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
            console.error("Error adding employee:", error);
           toast({
              variant: "destructive",
              title: "Failed to add employee",
              description: error.response?.data?.message || "An error occurred while adding the employee.",
            });
            setSubmitStatus({
                loading: false,
                success: false,
                error: error.response?.data?.message || 'An error occurred'
            });
        }
    };

    return (
        <>
            <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
                <div className="max-w-3xl space-y-6 mx-auto">
                    {/* Header */}
                    <div>
                    <h1 className="text-2xl font-bold">Add New Employee</h1>
                    <p className="text-muted-foreground">
                        Create a new employee record
                    </p>
                    </div>

                    {/* Card */}
                    <Card className="border-0 shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Add Employee
                        </CardTitle>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <CardContent className="space-y-6">
                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={employeeData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter full name"
                            />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                id="email"
                                name="email"
                                type="email"
                                value={employeeData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter email"
                                className="pl-10"
                                />
                            </div>
                            </div>

                            {/* Department */}
                            <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="department">Department *</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                                <Select
                                    value={employeeData.department}
                                    onValueChange={(value) =>
                                        handleChange({
                                        target: {
                                            name: "department",
                                            value,
                                        },
                                        })
                                    }
                                    >
                                    <SelectTrigger
                                        id="department"
                                        className="flex h-10 w-full pl-10 pr-10"
                                    >
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {(DEPARTMENTS ?? []).map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            </div>
                        </div>
                        </CardContent>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
                            <Button
                                type="submit"
                                className="gap-2"
                                disabled={!validateForm() || submitStatus.loading}
                            >
                                {submitStatus.loading ? (
                                "Adding Employee..."
                                ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Add Employee
                                </>
                                )}
                            </Button>

                            <Button variant="outline" type="button" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                    </Card>
                </div>
            </div>

        </>
    );
};

export default AddEmployeePage;