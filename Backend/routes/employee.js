import express from "express";
import {
  addEmployee,
  addLeave,
  fetchEmployee,
  fetchEmployeeByEmail,
  fetchEmployeeById,
  updateEmployee,
  updateSalary,
  uploadDetails,
  deleteEmployee,
} from "../controller/employeeController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/add", addEmployee);
router.get("/", fetchEmployee);
router.get("/fetchEmployeeByEmail/:email", fetchEmployeeByEmail);
router.get("/:id", fetchEmployeeById);

router.post("/addLeave/:id", addLeave);
router.post(
  "/uploadDetails",
  upload.fields([
    { name: "documentsPanCard", maxCount: 1 },
    { name: "documentsAadhar", maxCount: 1 },
    { name: "documentsDegree", maxCount: 1 },
    { name: "documentsExperience", maxCount: 1 },
  ]),
  uploadDetails
);

router.post("/updateSalary/:id", updateSalary);

router.put("/updateEmployee/:id", updateEmployee);

router.delete("/:id", deleteEmployee);

export default router;
