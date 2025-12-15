import mongoose from "mongoose";
import Employee from "../models/Employee.js"
import bcrypt from 'bcryptjs';
import stringTo6DigitNumber from "../utils/stringTo6digitNumber.js";

export const addEmployee = async (req, res) => {
    try{

        const emp = req.body;
        const newEmp = new Employee({
            name: emp.name,
            email: emp.email,
            department: emp.department
    });
    const exists = await Employee.findOne({email: emp.email});
    if(exists){
        return res.status(202).json({message: "Employee already exists"});
    }

    const savedEmp = await newEmp.save();
    if(savedEmp){
        res.status(201).json({message: "Employee saved!", savedEmp});
    }

    }
    catch(err){
        console.log(err)
        res.status(400).json({message: err});
    }
} 

export const fetchEmployeeById = async (req,res) => {
    try{
        const {id} = req.params;
        const { from, to, includeDocuments } = req.query; // optional date range filter and document inclusion

        const matchId = new mongoose.Types.ObjectId(id);

        // Build projection - exclude documents by default unless explicitly requested
        const baseProjection = {
            name: 1,
            email: 1,
            department: 1,
            empId: 1,
            details: 1,
            totalLeaveBalance: 1,
            payslips: 1,
            createdAt: 1,
            updatedAt: 1,
        };

        // Exclude document buffers unless includeDocuments=true
        if (includeDocuments !== "true") {
            baseProjection["details.documentsPanCard"] = 0;
            baseProjection["details.documentsAadhar"] = 0;
            baseProjection["details.documentsDegree"] = 0;
            baseProjection["details.documentsExperience"] = 0;
        }

        if (from || to) {
            const fromDate = from ? new Date(from) : null;
            const toDate = to ? new Date(to) : null;

            const pipeline = [
                { $match: { _id: matchId } },
                {
                    $project: {
                        ...baseProjection,
                        leaveHistory: {
                            $filter: {
                                input: "$leaveHistory",
                                as: "leave",
                                cond: {
                                    $and: [
                                        fromDate ? { $gte: ["$$leave.startDate", fromDate] } : true,
                                        toDate ? { $lte: ["$$leave.endDate", toDate] } : true,
                                    ],
                                },
                            },
                        },
                    },
                },
            ];

            const result = await Employee.aggregate(pipeline).exec();
            if (!result.length) {
                return res.status(404).json({ message: "Employee not found" });
            }
            return res.status(200).json({message: "employee fetched", employee: result[0]});
        }

        const employee = await Employee.findById(id, baseProjection).lean({ defaults: true, getters: false });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({message: "employee fetched",employee});
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: err.message || err });
    }
}

export const fetchEmployee = async (req,res) => {
    try{
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
        const fields = req.query.fields;
        const excludeDocuments = req.query.excludeDocuments === "true";

        // Build projection object
        let projection = {};
        
        if (excludeDocuments) {
            // Use exclusion-only projection to remove document buffers
            projection = {
                "details.documentsPanCard": 0,
                "details.documentsAadhar": 0,
                "details.documentsDegree": 0,
                "details.documentsExperience": 0
            };
        } else if (fields) {
            // Use inclusion projection only if specific fields are requested
            const requestedFields = fields.split(",").map(f => f.trim());
            requestedFields.forEach(field => {
                projection[field] = 1;
            });
        }
        // If neither excludeDocuments nor fields, return all data (empty projection)

        const employees = await Employee.find({}, projection)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean({ defaults: true, getters: false });

        return res.status(200).json({message: "Employees fetched", employees});
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

        const updatedEmp = await Employee.findByIdAndUpdate(
            id, // Find the employee by empId
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
    const details = JSON.parse(req.body.newEmployee);
    const email = req.body.empEmail;

    const documents = {
        documentsPanCard: req.files.documentsPanCard ? req.files.documentsPanCard[0].buffer : null,
        documentsAadhar: req.files.documentsAadhar ? req.files.documentsAadhar[0].buffer : null,
        documentsDegree: req.files.documentsDegree ? req.files.documentsDegree[0].buffer : null,
        documentsExperience: req.files.documentsExperience ? req.files.documentsExperience[0].buffer : null,
    };

    const empId = stringTo6DigitNumber(email);

    const newDetails = {
        employeeDetailId:empId,
        ...details,
        ...documents
    }

    

    const updatedEmp = await Employee.findOneAndUpdate({email: email},
        {details: newDetails},
        {new: true}
    )

    res.status(201).json({message: "Details uploaded", updatedEmp});
}

export const fetchEmployeeByEmail = async (req, res) => {
  try {
    const { email } = req.params;
   
    const emp = await Employee.findOne({"details.email" : email});

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(emp);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateSalary = async (req,res) => {
    try{

        const {salary} = req.body;
        const {id} = req.params;
        
        const updatedUser = await Employee.findByIdAndUpdate(
            id,
            { $set: { "details.salary": salary } }, // Using dot notation to update nested field
            { new: true } // Returns the updated document
        );

        if(updatedUser){
            res.status(201).json({message: "Salary updated successfully", updatedUser});
        }
    }
    catch(err){
        console.log(err);
    }
}