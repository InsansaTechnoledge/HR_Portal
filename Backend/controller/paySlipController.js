import { response } from "express";
import Payslip from "../models/PaySlip.js";

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