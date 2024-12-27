import Employee from "../models/Employee.js"
import bcrypt from 'bcryptjs';

export const addEmployee = async (req, res) => {
    try{

        const emp = req.body;
        
        const newEmp = new Employee({
            name: emp.name,
            email: emp.email,
            department: emp.department
    });
    
    const savedEmp = await newEmp.save();
    
    res.status(201).json({message: "Employee saved!", savedEmp});
    }
    catch(err){
        console.log(err)
        res.status(400).json({message: err});
    }
} 

export const fetchEmployeeById = async (req,res) => {
    try{
        const {id} = req.params;
        const employee = await Employee.find({empId:id});

        res.status(201).json({message: "employee fetched",employee:employee});
    }
    catch(err){
        console.log(err);
    }
}

export const fetchEmployee = async (req,res) => {
    try{

        const employees = await Employee.find();
        res.status(201).json({message: "Fetched Employees", employees});
    }
    catch(Err){
        console.log(Err);
        res.status(400).json({message: Err});
    }
}

export const addLeave = async (req,res) => {
    try{
        const {id} = req.params;
        const leaveHistory = req.body;
        const updatedEmp = await Employee.findOneAndUpdate(
            { empId: id }, // Find the employee by empId
            { $push: { leaveHistory: leaveHistory } }, // Append the new leaveHistory object to the array
            { new: true } // Return the updated document
        );
    
        if (!updatedEmp) {
            return res.status(404).send({ message: "Employee not found" });
        }
    
        res.status(201).json({message:"Leave added", updatedEmp});
    


    }
    catch(err){
        console.log(err);
        res.status(400).json({message:err});
    }
}

export const uploadDetails = async (req,res) => {
    const details = req.body.newEmployee;
    const email = req.body.empEmail;
    console.log(JSON.stringify(details, null, 2));
    console.log(details.name);

    const documents = {
        documentsPancard: req.files.documentsPanCard ? req.files.documentsPanCard[0].buffer : null,
        documentsAadhar: req.files.documentsAadhar ? req.files.documentsAadhar[0].buffer : null,
        documentsDegree: req.files.documentsDegree ? req.files.documentsDegree[0].buffer : null,
        documentsExperience: req.files.documentsExperience ? req.files.documentsExperience[0].buffer : null,
    };

    const hashedEmail = await bcrypt.hash(email, 6);
    console.log(hashedEmail);

    const newDetails = {
        empId:hashedEmail,
        ...details,
        ...documents
    }

    // console.log(newDetails);

    // const updatedEmp = await Employee.findOneAndUpdate({email: email},
    //     {details: newDetails},
    //     {new: true}
    // )

}

export const fetchEmployeeByEmail = async (req,res) => {
    try{

        const {email} = req.params;
        
        const emp = await Employee.findOne({email: email});
        
        if(emp){
            res.status(201).json(emp);
        }
    }
    catch(err){
        console.log(err);
    }
}