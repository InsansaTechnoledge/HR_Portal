import Employee from "../models/Employee.js"

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
    const details = req.body;

    console.log(req.files);
}