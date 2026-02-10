import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Save, RefreshCw, Loader2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../../hooks/useToast';
import { motion } from 'framer-motion';

const UserUpsertForm = () => {
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        password: '',
        role: 'user'
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roles = [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
        { value: 'superAdmin', label: 'Super Admin' },
        { value: 'accountant', label: 'Accountant' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value) => {
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/upsertUser`, formData);

            if (response.status === 200 || response.status === 201) {
                toast({
                    variant: "success",
                    title: "Success",
                    description: response.data.message || "Operation successful",
                });

                // Clear password after success but keep email for context if updating
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } catch (error) {
            console.error("Upsert error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full flex items-center justify-center p-4 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Access Management</CardTitle>
                        <CardDescription>Register a new user or update existing credentials</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email - Primary Key for Upsert */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="userEmail" className="text-sm font-medium">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="userEmail"
                                            name="userEmail"
                                            type="email"
                                            placeholder="janedoe@example.com"
                                            className="pl-10 h-11 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                            value={formData.userEmail}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic px-1">
                                        * Using an existing email will update that user's details.
                                    </p>
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label htmlFor="userName" className="text-sm font-medium">Username / Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="userName"
                                            name="userName"
                                            placeholder="Jane Doe"
                                            className="pl-10 h-11 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                            value={formData.userName}
                                            onChange={handleChange}
                                            required={!formData.userEmail}
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Assign Role</Label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Password */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!formData.userEmail}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Submit Credentials
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11"
                                    onClick={() => setFormData({ userName: '', userEmail: '', password: '', role: 'user' })}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default UserUpsertForm;
