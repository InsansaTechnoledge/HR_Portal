import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate ,useLocation} from 'react-router-dom';
import { userContext } from '../../Context/userContext';
import ErrorToast from '../Toaster/ErrorToaster';
import SuccessToast from '../Toaster/SuccessToaser';
import API_BASE_URL from "../../config.js"

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { toast } from '../../hooks/use-toast';
import { Building2, Lock, Mail, ArrowRight, Sparkles, Users, FolderKanban, Clipboard, ClipboardCheckIcon, BadgeIndianRupee} from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';
import {toast} from '../../hooks/useToast.js';

const Login = () => {
    const [userEmail, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useContext(userContext);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    // const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Make a POST request to the backend
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                userEmail,
                password,
            }, { withCredentials: true });
            
            if(response.status===200){
              setUser(response.data.user);
                toast({
                  variant: "success",
                  title: "Login successful",
                  description: "Welcome back to HR Portal",
                });
                // Redirect to the desired page after login
                   setTimeout(() => {
                    navigate("/");
                  }, 3000); 
            }
            else if(response.status===202){
              toast({
                variant: "destructive",
                title: "Login failed",
                description:
                  error.response?.data?.message || "Please verify your email before logging in",
            });
              setErrorMessage('Please verify your email before logging in.');
            }
            setIsLoading(false);
        } catch (error) {
            // Handle errors
           toast({
              variant: "destructive",
              title: "Login failed",
              description:
                error.response?.data?.message || "Invalid credentials",
            });
            setIsLoading(false);
        }
    };
    
    return (
        <>
        {
          successMessage && (<SuccessToast message={successMessage} onClose={() => setSuccessMessage('')} />)
        }
        {
          errorMessage && (<ErrorToast error={errorMessage} onClose={() => setErrorMessage('')} />)
        }
        <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-hr-navy via-hr-navy-light to-hr-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-48 h-48 bg-hr-amber/10 rounded-full blur-2xl animate-pulse-soft"
            style={{ animationDelay: '0.5s' }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-sidebar-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">HR Portal</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Streamline Your <br />
            <span className="text-gradient">Workforce Management</span>
          </h1>

          <p className="text-sidebar-foreground/70 text-lg mb-8 max-w-md">
            Empower your HR team with modern tools for employee management,
            leave tracking, payroll, and recruitment.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: <Users/>, label: 'Employee Management' },
              { icon: <FolderKanban/>, label: 'Job Application Management' },
              { icon: <ClipboardCheckIcon/>, label: 'Leave Tracking' },
              { icon: <BadgeIndianRupee />, label: 'Payroll System' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50 backdrop-blur-sm"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HR Portal</span>
          </div>

          <Card className="border-0 shadow-soft">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Welcome back
                </span>
              </div>
              <CardTitle className="text-2xl font-bold">
                Sign in to your account
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the HR portal
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label>Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={userEmail}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
        </>
    );
};

export default Login;
