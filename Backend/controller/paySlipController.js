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

export const fetchByEmployeeId = async (req,res) => {
    try{
        const {id} = req.params;
        const paySlips = await Payslip.find({employeeId: id});
        
        if(paySlips){
            res.status(201).json({message: "Payslips fetched", paySlips});
        }
    }
    catch(err){
        console.log(err);
    }  
}