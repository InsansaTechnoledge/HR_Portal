import React, { useState, useContext, useEffect } from 'react';
import { userContext } from '../Context/userContext';
import InvestmentDeclarationForm from '../Components/InvestmentDeclaration/InvestmentDeclarationForm';
import { Card, CardContent } from '../Components/ui/card';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Components/ui/button';
import { useToast } from '../Components/ui/use-toast';
import axios from 'axios';
import API_BASE_URL from '../config';


const InvestmentDeclaration = () => {
    const { user } = useContext(userContext);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [employeeId, setEmployeeId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'superAdmin' || user.role === 'accountant') {
                // For admin/accountant, check if an employeeId is provided in the URL
                const params = new URLSearchParams(window.location.search);
                const queryEmployeeId = params.get('employeeId');
                if (queryEmployeeId) {
                    setEmployeeId(queryEmployeeId);
                }
            } else {
                // Regular employees
                findEmployeeRecord();
            }
            setLoading(false);
        }
    }, [user]);

    const axiosInstance = React.useMemo(() => {
        const instance = axios.create({
            baseURL: API_BASE_URL,
            withCredentials: true
        });
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        return instance;
    }, []);

    const findEmployeeRecord = async () => {
        try {
            const storedEmployeeId = localStorage.getItem('employeeId');
            if (storedEmployeeId) {
                setEmployeeId(storedEmployeeId);
            } else if (user && user.userEmail) {
                const response = await fetch(
                    `${API_BASE_URL}/api/employee/?email=${user.userEmail}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        }
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.employees && data.employees.length > 0) {
                        setEmployeeId(data.employees[0]._id);
                        localStorage.setItem('employeeId', data.employees[0]._id);
                    }
                }
            }
        } catch (error) {
            console.error('Error finding employee:', error);
        }
    };

    const handleSuccess = () => {
        toast({
            title: 'Success',
            description: 'Declaration saved successfully!',
            variant: 'success'
        });
        // Optionally redirect to tracker if admin
        if (user?.role === 'admin' || user?.role === 'superAdmin' || user?.role === 'accountant') {
            navigate('/investment-tracker');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 font-medium animate-pulse">Loading Investment Declaration...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="border-slate-200">
                        <CardContent className="p-12 text-center">
                            <div className="space-y-4">
                                <p className="text-slate-600 text-lg">Please log in to access the Investment Declaration Form</p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Reverted Header UI */}
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Investment Declaration</h1>
                                <p className="text-base text-slate-600 mt-1">Submit your investment and deduction details for tax planning</p>
                                {/* <p className="text-sm text-slate-500 mt-2">Financial Year 2025-26 (April 1, 2025 - March 31, 2026)</p> */}
                            </div>
                        </div>
                    </div>
                </div>

                <InvestmentDeclarationForm
                    employeeId={employeeId}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default InvestmentDeclaration;
