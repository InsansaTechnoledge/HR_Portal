import { response } from "express";
import Payslip from "../models/PaySlip.js";
import Employee from "../models/Employee.js";

export const generatePaySlip = async (req, res) => {
    try{

        const payslip = req.body;
        
        const newPayslip = new Payslip(payslip);
        
        const saved = await newPayslip.save();
        
        if(saved){
            res.status(201).json({message: "saved",paySlip: newPayslip});
        }
    }
    catch(err){
        console.log(err);
    }
}

export const getPayslips = async (req,res) => {
    try{
        const paySlips = await Payslip.find();
        if(paySlips){
            res.status(201).json({message: "Payslips fetched", paySlips});
        }
    }
    catch(err){
        console.log(err);
    }
}

// export const fetchByEmployeeId = async (req,res) => {
//     try{
//         const {id} = req.params;
//         const paySlips = await Payslip.find({employeeId: id});
        
//         if(paySlips){
//             res.status(201).json({message: "Payslips fetched", paySlips});
//         }
//     }
//     catch(err){
//         console.log(err);
//     }  
// }

export const fetchPaySlipbyEmployeeEmail = async(req,res)=>{
  try {
    const { email } = req.params;

    // Find employee by email
    const employee = await Employee.findOne({ email })
      .populate('payslips')  // This fetches all referenced payslips
      .exec();

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Return all payslips for this employee
    res.status(200).json({
      success: true,
      payslips: employee.payslips,
      message: `Found ${employee.payslips.length} payslips`
    });
}
catch(err){
    console.log(err);
    return res.status(500).json({success:false,
        message:err.message
     });
}
}