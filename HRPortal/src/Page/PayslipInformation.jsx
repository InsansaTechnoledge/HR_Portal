import React, { useState, useContext, useEffect } from "react";
import { userContext } from "../Context/userContext";
import axios from 'axios';
import API_BASE_URL from "../config";
import EmployeeDetailsForm from "../Components/Form/EmployeeDetailsForm";
import EmployeeDetailsDisplay from "../Components/EmployeeDetails/EmployeeDetailsDisplay";
import Loader from "../Components/Loader/Loader";

const EmployeeManagementForm = () => {

    const {user} = useContext(userContext);
    const [employee,setEmployee] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            const response = await axios.get(`${API_BASE_URL}/api/employee/fetchEmployeeByEmail/${user.userEmail}`);
            
            if(response.status===201){
                setEmployee(response.data);
                setLoading(false);
            }
        }

        fetchEmployeeData();
    },[])

    if(loading){
        return(
            <Loader/>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {
                employee && employee.details
                ?
                <EmployeeDetailsDisplay employee={employee}/>
                :
                <EmployeeDetailsForm setEmployee={setEmployee}/>
            }

        </div>
    );
};

export default EmployeeManagementForm;
