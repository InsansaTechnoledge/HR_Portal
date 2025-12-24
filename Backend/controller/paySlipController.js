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

    const existingPayslip = await Payslip.findOne({
      employeeId: payslipData.employeeId,
      month: payslipData.month,
      year: payslipData.year,
    });

    if (existingPayslip) {
      return res.status(409).json({
        message: "Payslip already generated for this month",
      });
    }

    // Create payslip with template
    const newPayslip = new Payslip({
      ...payslipData,
      template: payslipData.template || 'classic'
    });
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    const fields = req.query.fields || "employeeId name department month salary totalEarnings totalDeductions netSalary";
    const month = req.query.month; // optional filter
    const employeeId = req.query.employeeId; // optional filter

    const query = {};
    if (month) query.month = month;
    if (employeeId) query.employeeId = employeeId;

    const paySlips = await Payslip.find(query, fields.split(",").join(" "))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ defaults: true, getters: false });

    res.status(200).json({message: "Payslips fetched", paySlips});
  }
  catch(err){
    console.log(err);
    res.status(500).json({ message: err.message || err });
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

export const fetchPaySlipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payslip = await Payslip.findById(id).lean({ defaults: true, getters: false });
    
    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    
    res.status(200).json({
      success: true,
      payslip,
      message: "Payslip fetched successfully"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const fetchPaySlipbyEmployeeEmail = async(req,res)=>{
  try {
    const { email } = req.params;
    const { month, page = 1, limit = 100 } = req.query;

    // Find employee by email (without populating heavy refs)
    const employee = await Employee.findOne({ email: email }).select("empId name email department");
    if (!employee) {
      return res.status(404).json({ message: "Currently You are not Employee " });
    }

    const payslipQuery = { employeeId: String(employee.empId) };
    if (month) payslipQuery.month = month;

    const payslips = await Payslip.find(payslipQuery, "employeeId name department month salary totalEarnings totalDeductions netSalary template")
      .skip((Math.max(parseInt(page, 10), 1) - 1) * Math.min(Math.max(parseInt(limit, 10), 1), 500))
      .limit(Math.min(Math.max(parseInt(limit, 10), 1), 500))
      .lean({ defaults: true, getters: false });

    res.status(200).json({
      success: true,
      payslips,
      message: `Found ${payslips.length} payslips`
    });
}
catch(err){
    console.log(err);
    return res.status(500).json({success:false,
        message:err.message
     });
}
}