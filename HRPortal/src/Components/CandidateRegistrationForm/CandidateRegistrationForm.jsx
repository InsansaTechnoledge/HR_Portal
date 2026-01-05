import React, { useState } from 'react'
import API_BASE_URL from '../../config';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.jsx';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';

import { Hourglass, Linkedin, Microchip, User, Mail, Phone, Upload, Save, ChevronDown } from 'lucide-react';
import { toast } from '../../hooks/useToast.js';

const CandidateRegistrationForm = () => {

    const technologies = ['SAP MM', 'SAP PP', 'SAP PPQM', 'SAP SD', 'SAP FICO', 'SAP FI', 'SAP CO', 'SAP ABAP', 'SAP EWM', 'SAP WM', 'SAP Vistex', 'SAP Planning', 'SAC Datasphere', 'SAP Security', 'SAP CRM Technical', 'SAP CRM Functional', 'SAP HCM', 'PowerBi', 'PowerApp', 'SAP Concur', 'Salesforce', 'Salesforce CPQ']

    const [fileName, setFileName] = useState("");
    const [file,setFile] = useState();
    const [technology, setTechnology] = useState("");
    const [status, setStatus] = useState("");

    const [submitStatus, setSubmitStatus] = useState({
            loading: false,
            success: false,
            error: null
        });

    const fileChangeHandler = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setFileName(file.name);
            setFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const onCancelHandler = () => {
        document.getElementById("candidateForm").reset();
        setFileName(null); // reset uploaded file name (important)
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const client = document.getElementById("client").value;
        const email = document.getElementById("email").value;
        const contactno = document.getElementById("contact-no").value;
        const linkedin = document.getElementById("linkedin").value;
        const resume = document.getElementById("resume").files[0] || file;

        if (!resume) {
            // alert("Please upload a resume.");
            toast ({
                variant: "destructive",
                title: "Resume Missing",
                description: "Please upload a resume.",
            });
            return;
        }

        setSubmitStatus({ loading: true, success: false, error: null });

        const formData = new FormData();
        formData.append("name", name);
        formData.append("technology", technology);
        formData.append("client", client);
        formData.append("email", email);
        formData.append("contact_no", contactno);
        formData.append("source", source);
        formData.append("linkedIn", linkedin);
        formData.append("resume", resume); // Attach the file

        try {
            const response = await axios.post(`${API_BASE_URL}/api/candidate/add`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            
            // alert(response.data.message);
            setSubmitStatus({
                    loading: false,
                    success: true,
                    error: null
                });
                    toast ({
                        variant: "success",
                        title: "Candidate Registered",
                        description: response.data.message || "Candidate registered successfully.",
                    });
                    document.getElementById("candidateForm").reset();
                    setFileName(null); // reset uploaded file name (important)
        } catch (error) {
                setSubmitStatus({
                    loading: false,
                    success: true,
                    error: null
                });

                if(error.response.status === 409){
                    toast ({
                        variant: "destructive",
                        title: "Registration Failed",
                        description: "Candidate Already Registered.",
                    });
                }
                else{
                    toast ({
                        variant: "destructive",
                        title: "Registration Failed",
                        description: error.response.data.message || "Failed to register candidate.",
                    });
                }
        }
    };

    return (
        <>
       <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div>
                <h1 className="text-2xl font-bold">Register Candidate</h1>
                <p className="text-muted-foreground">
                    Add a new candidate to the talent pool
                </p>
                </div>

                <form id="candidateForm" className="space-y-6" onSubmit={onSubmitHandler}>
                {/* Candidate Information */}
                <Card className="border-0 shadow-card">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Candidate Information
                    </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                    {/* FORM GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                            placeholder="Enter full name"
                            id="name"
                            name="name"
                            required
                        />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                        <Label>Email *</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                placeholder="Enter email"
                                className="pl-10"
                                type="email"
                                required
                            />
                        </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                        <Label>Contact Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" id="contact-no" placeholder="Enter number" className="pl-10" />
                        </div>
                        </div>

                        {/* Technology */}
                        <div className="space-y-2">
                            <Label>Technology</Label>
                            <div className="relative">
                                <Microchip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Select value={technology} onValueChange={setTechnology}>
                                    <SelectTrigger
                                        id="technology"
                                        className="h-10 w-full pl-10 pr-10"
                                    >
                                        <SelectValue placeholder="Select technology" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                        {technologies.map((tech, id) => (
                                            <SelectItem key={id} value={tech}>
                                            {tech}
                                            </SelectItem>
                                        ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Client */}
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Input type="text" id="client" placeholder="Client name" />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="relative">
                                <Hourglass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger
                                        id="source"
                                        name="source"
                                        className="h-10 w-full pl-10 pr-10"
                                    >
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                        <SelectItem value="Accepted">Accepted</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="On hold">On hold</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-2 sm:col-span-2">
                        <Label>LinkedIn Profile</Label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                id='linkedin'
                                placeholder="Enter link"
                                className="pl-10"
                            />
                        </div>
                        </div>

                        {/* Resume */}
                        <div className="space-y-2 sm:col-span-2">
                        <Label>Resume / CV</Label>
                        <label
                            htmlFor="resume"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition hover:border-primary/50"
                        >
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <input
                                id="resume"
                                type="file"
                                className="hidden"
                                onChange={fileChangeHandler}
                                onDrop={(e) => handleDrop(e)}
                                onDragOver={(e) => handleDragOver(e)}
                            />
                            {fileName ? (
                            <p className="text-sm">
                                Selected file: <span className="font-medium">{fileName}</span>
                            </p>
                            ) : (
                            <p className="text-sm text-muted-foreground">
                                Click to upload or drag and drop
                            </p>
                            )}
                        </label>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="gap-2">
                        {submitStatus.loading ? (
                            "Registering Candidate..."
                            ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Register Candidate
                            </>
                        )}
                    </Button>
                    {/* <Button variant="outline">Save as Draft</Button> */}
                    <Button type="button" variant="outline" onClick={onCancelHandler}>Cancel</Button>
                </div>
                </form>
            </div>
        </div>
    </>
    )
}

export default CandidateRegistrationForm