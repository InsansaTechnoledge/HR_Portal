import React, { useState } from 'react'
import API_BASE_URL from '../../config';
import axios from 'axios';
import ErrorToast from '../Toaster/ErrorToaster.jsx';
import SuccessToast from '../Toaster/SuccessToaser.jsx'

const CandidateRegistrationForm = () => {

    const technologies = ['SAP MM', 'SAP PP', 'SAP PPQM', 'SAP SD', 'SAP FICO', 'SAP FI', 'SAP CO', 'SAP ABAP', 'SAP EWM', 'SAP WM', 'SAP Vistex', 'SAP Planning', 'SAC Datasphere', 'SAP Security', 'SAP CRM Technical', 'SAP CRM Functional', 'SAP HCM', 'PowerBi', 'PowerApp', 'SAP Concur', 'Salesforce', 'Salesforce CPQ']

    const [fileName, setFileName] = useState("");
    const [file,setFile] = useState();
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
        const [toastErrorMessage, setToastErrorMessage] = useState();
        const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
        const [toastErrorVisible, setToastErrorVisible] = useState(false);

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

    const onSubmitHandler = async () => {
        const name = document.getElementById("name").value;
        const technology = document.getElementById("technology").value;
        const client = document.getElementById("client").value;
        const email = document.getElementById("email").value;
        const contactno = document.getElementById("contact-no").value;
        const source = document.getElementById("source").value;
        const linkedin = document.getElementById("linkedin").value;
        const resume = document.getElementById("resume").files[0] || file;

        if (!resume) {
            // alert("Please upload a resume.");
            setToastErrorMessage("Please upload a resume.");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
            return;
        }

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
            const response = await axios.post(API_BASE_URL + "/api/candidate/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // alert(response.data.message);
            setToastSuccessMessage(response.data.message);
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);
        } catch (error) {
            // console.error("Error while registering candidate:", error.response?.data || error.message);
            // alert("Error while registering candidate. Please try again.");
            setToastErrorMessage("Error while registering candidate. Please try again.");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
        }
    };

    return (
        <>
        {
            toastSuccessVisible ? <SuccessToast message={toastSuccessMessage}/> : null
        }
        {
            toastErrorVisible ? <ErrorToast error={toastErrorMessage}/> : null
        }
        <div>
            <div className="flex min-h-full flex-1 flex-col justify-center px-2 py-2 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">

                    <h1 className="mt-10 text-center text-4xl/6 font-bold tracking-tight text-gray-900">
                        Register Candidate
                    </h1>
                </div>

                <div className="mt-12 sm:mx-auto w-full sm:max-w-3xl">
                    <form className="space-y-6">
                        <div className="sm:grid grid-cols-2 gap-x-10 gap-y-7">
                            <div>
                                <div className='flex items-center justify-between'>
                                    <label htmlFor="email" className="block text-base/6 font-medium text-gray-900">
                                        Name
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        className="block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="technology" className="block text-base/6 font-medium text-gray-900">
                                        Technology
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <select
                                        id='technology'
                                        className='block w-full rounded-md bg-white px-3 py-3.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'>
                                        <option value={"Select technology"}>Select technology</option>
                                        {
                                            technologies.map((tech, id) => {
                                                return <option key={id} value={tech}>{tech}</option>
                                            })
                                        }

                                    </select>

                                </div>
                            </div>
                            <div>
                                <div className='flex items-center justify-between'>
                                    <label htmlFor="client" className="block text-base/6 font-medium text-gray-900">
                                        Client
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="client"
                                        name="client"
                                        type="text"
                                        required
                                        autoComplete="client"
                                        className="block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="email" className="block text-base/6 font-medium text-gray-900">
                                        Email
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='flex items-center justify-between'>
                                    <label htmlFor="contact-no" className="block text-base/6 font-medium text-gray-900">
                                        Contact No
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="contact-no"
                                        name="contact-no"
                                        type="number"
                                        required
                                        autoComplete="contact-no"
                                        className="block w-full rounded-md bg-white px-3 py-3.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="source" className="block text-base/6 font-medium text-gray-900">
                                        Source
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="source"
                                        name="source"
                                        type="text"
                                        required
                                        autoComplete="source"
                                        className="block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='flex items-center justify-between'>
                                    <label htmlFor="linkedin" className="block text-base/6 font-medium text-gray-900">
                                        LinkedIn Profile
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="linkedin"
                                        name="linkedin"
                                        type="text"
                                        required
                                        autoComplete="linkedin"
                                        className="block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="resume-upload" className="block text-base/6 font-medium text-gray-900">
                                        Upload Resume
                                    </label>
                                </div>
                                <div className="mt-2">
                                    {/* <input
                                    id="resume-upload"
                                    name="resume-upload"
                                    type="file"
                                    required
                                    autoComplete="resume-upload"
                                    className="block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                /> */}

                                    <div className="flex items-center justify-center w-full">
                                        <label forName="resume" className="flex flex-col items-center justify-center p-4 w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 "
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}>
                                            <div className="flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                </svg>
                                                {fileName ?
                                                    (
                                                        <p className="ml-3 text-sm text-gray-500">
                                                            Selected file: <span className="font-medium">{fileName}</span>
                                                        </p>
                                                    )
                                                    :
                                                    (<p className="ml-3 text-sm text-gray-500 "><span className="font-semibold">Click to upload</span> or drag and drop</p>)
                                                }
                                            </div>
                                            <input id="resume" type="file" className="hidden" onChange={fileChangeHandler} />
                                        </label>

                                    </div>

                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                className="mt-10 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={onSubmitHandler}
                            >
                                Register
                            </button>
                        </div>
                    </form>


                </div>
            </div>
        </div>
        </>
    )
}

export default CandidateRegistrationForm