import { response } from "express";
import Payslip from "../models/PaySlip.js";
import Employee from "../models/Employee.js";

export const generatePaySlip = async (req, res) => {
  try {
    const payslipData = req.body;

    // Find employee first
    const employee = await Employee.findOne({ empId: Number(payslipData.employeeId )});

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Create payslip
    const newPayslip = new Payslip(payslipData);
    const savedPayslip = await newPayslip.save();

    // Push payslip ID into employee.payslips
    employee.payslips.push(savedPayslip._id);
    await employee.save();

    // Success response
    res.status(201).json({
      message: "Payslip generated and linked to employee successfully",
      payslip: savedPayslip,
    });

  } catch (err) {
    console.error("Generate Payslip Error:", err);
    res.status(500).json({
      message: "Failed to generate payslip",
      error: err.message,
    });
  }
};

export const getPayslips = async (req,res) => {
    try{
        const paySlips = await Payslip.find();
        console.log(paySlips);
        if(paySlips){
            res.status(200).json({message: "Payslips fetched", paySlips});
        }
        else{
            res.status(201).json({message:"No Payslips Found"})
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
//             res.status(200).json({message: "Payslips fetched", paySlips});
//         }
//         else{
//             res.status(201).json({message:"No Payslips Found"})
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
    const employee = await Employee.findOne({email:email})
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