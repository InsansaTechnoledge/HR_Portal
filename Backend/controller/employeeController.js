import mongoose from "mongoose";
import Employee from "../models/Employee.js"
import stringTo6DigitNumber from "../utils/stringTo6digitNumber.js";

export const addEmployee = async (req, res) => {
    try {

        const emp = req.body;
        const newEmp = new Employee({
            name: emp.name,
            email: emp.email,
            department: emp.department
        });
        const exists = await Employee.findOne({ email: emp.email });
        if (exists) {
            return res.status(202).json({ message: "Employee already exists" });
        }

        const savedEmp = await newEmp.save();
        if (savedEmp) {
            res.status(201).json({ message: "Employee saved!", savedEmp });
        }

    }
    catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}

export const fetchEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { from, to, includeDocuments } = req.query; // optional date range filter and document inclusion

        // Validate Mongo ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid employee id format" });
        }
        const matchId = new mongoose.Types.ObjectId(id);

        // Build projection - exclude documents by default unless explicitly requested
        const baseProjection = {
            name: 1,
            email: 1,
            department: 1,
            empId: 1,
            details: 1,
            totalLeaveBalance: 1,
            leaveHistory: 1,
            payslips: 1,
            createdAt: 1,
            updatedAt: 1,
        };

        // Exclude document buffers unless includeDocuments=true
        // if (includeDocuments !== "true") {
        //     baseProjection["details.documentsPanCard"] = 0;
        //     baseProjection["details.documentsAadhar"] = 0;
        //     baseProjection["details.documentsDegree"] = 0;
        //     baseProjection["details.documentsExperience"] = 0;
        // }

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
                                        ...(fromDate ? [{ $gte: ["$$leave.startDate", fromDate] }] : []),
                                        ...(toDate ? [{ $lte: ["$$leave.endDate", toDate] }] : []),
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
            return res.status(200).json({ message: "employee fetched", employee: result[0] });
        }

        const employee = await Employee.findById(id, baseProjection).lean({ defaults: true, getters: false });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "employee fetched", employee });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message || err });
    }
}

export const fetchEmployee = async (req, res) => {
    try {
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

        return res.status(200).json({ message: "Employees fetched", employees });
    }
    catch (Err) {
        console.log(Err);
        res.status(400).json({ message: Err });
    }
}

export const addLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leaveHistory = req.body;
        const updatedEmp = await Employee.findByIdAndUpdate(
            id, // Find the employee by empId
            { $push: { leaveHistory: leaveHistory } }, // Append the new leaveHistory object to the array
            { new: true } // Return the updated document
        );

        if (!updatedEmp) {
            return res.status(404).send({ message: "Employee not found" });
        }

        // Create notifications for Admins/SuperAdmins
        try {
            const admins = await User.find({ role: { $in: ['admin', 'superAdmin'] } });
            const notificationPromises = admins.map(admin => {
                const notification = new Notification({
                    recipient: admin._id,
                    recipientType: 'User',
                    sender: updatedEmp._id,
                    senderType: 'Employee',
                    type: 'LEAVE_APPLIED',
                    message: `${updatedEmp.name} from ${updatedEmp.department} has applied for ${leaveHistory.type} leave from ${new Date(leaveHistory.startDate).toLocaleDateString()} to ${new Date(leaveHistory.endDate).toLocaleDateString()}.`,
                    relatedId: updatedEmp._id
                });
                return notification.save();
            });
            await Promise.all(notificationPromises);
        } catch (notifErr) {
            console.error("Failed to create notifications:", notifErr);
        }

        res.status(201).json({ message: "Leave added", updatedEmp });



    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err });
    }
}

export const uploadDetails = async (req, res) => {
    try {

        if (!req.body.newEmployee) {
            console.error("Missing newEmployee in body");
            return res.status(400).json({ message: "Employee details are required" });
        }

        const details = JSON.parse(req.body.newEmployee);
        const email = details.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required in employee details" });
        }

        // Check if employee exists
        const existingEmployee = await Employee.findOne({ email: email });
        if (existingEmployee && existingEmployee.details && Object.keys(existingEmployee.details).length > 0) {
            return res.status(401).json({ message: "Employee details already exists" });
        }

        if (!existingEmployee) {
            console.error("Employee not found:", email);
            return res.status(404).json({ message: "Employee not found with this email" });
        }

        // Helper to map Cloudinary file → schema object
        const mapCloudinaryFile = (file) => {
            console.log("Mapping file:", {
                originalname: file.originalname,
                path: file.path,
                filename: file.filename,
                mimetype: file.mimetype
            });
            return {
                url: file.path,
                publicId: file.filename,
                originalName: file.originalname,
                format: file.mimetype ? file.mimetype.split('/')[1] : (file.originalname?.split('.').pop() || 'unknown')
            };
        };

        const documents = {};
        if (req.files?.documentsPanCard?.[0]) {
            documents.documentsPanCard = mapCloudinaryFile(req.files.documentsPanCard[0]);
        }
        if (req.files?.documentsAadhar?.[0]) {
            documents.documentsAadhar = mapCloudinaryFile(req.files.documentsAadhar[0]);
        }
        if (req.files?.documentsDegree?.[0]) {
            documents.documentsDegree = mapCloudinaryFile(req.files.documentsDegree[0]);
        }
        if (req.files?.documentsExperience?.[0]) {
            documents.documentsExperience = mapCloudinaryFile(req.files.documentsExperience[0]);
        }

        const empId = stringTo6DigitNumber(email);

        const newDetails = {
            employeeDetailId: empId,
            ...details,
            ...documents
        };

        const updatedEmp = await Employee.findOneAndUpdate(
            { email: email },
            { details: newDetails },
            { new: true }
        );

        if (!updatedEmp) {
            console.error("Update failed for:", email);
            return res.status(404).json({ message: "Failed to update employee" });
        }

        return res.status(200).json({ message: "Details uploaded", updatedEmp });
    } catch (err) {
        console.error("[uploadDetails] Error:", err);
        return res.status(500).json({ message: err.message || "Failed to upload details" });
    }
}

export const fetchEmployeeByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const emp = await Employee.findOne({ email: email })

        if (!emp) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(emp);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const updateSalary = async (req, res) => {
    try {

        const { salary } = req.body;
        const { id } = req.params;

        const updatedUser = await Employee.findByIdAndUpdate(
            id,
            { $set: { "details.salary": salary } }, // Using dot notation to update nested field
            { new: true } // Returns the updated document
        );

        if (updatedUser) {
            res.status(201).json({ message: "Salary updated successfully", updatedUser });
        }
    }
    catch (err) {
        console.log(err);
    }
}


export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (!employee.details || typeof employee.details !== "object") {
            employee.details = {};
        }

        //Parse payload properly (accepts string or object; fails fast on bad input)
        let payload = req.body?.newEmployee !== undefined ? req.body.newEmployee : req.body;

        if (typeof payload === "string") {
            try {
                payload = JSON.parse(payload);
            } catch (parseErr) {
                console.error("Update Employee JSON parse error:", parseErr);
                return res.status(400).json({ message: "Invalid payload format" });
            }
        }

        // Guard against null/undefined after parse
        if (!payload || typeof payload !== "object") {
            return res.status(400).json({ message: "Invalid payload content" });
        }

        //Update ONLY allowed fields
        Object.entries(payload).forEach(([key, value]) => {
            employee.details[key] = value;
        });

        await employee.save();

        res.status(200).json({
            message: "Employee details updated successfully",
            employee
        });
    } catch (err) {
        console.error("Update Employee Error:", err);
        res.status(500).json({ message: err.message });
    }
};






export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Employee.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Employee not found" });
        return res.status(200).json({ message: "Employee deleted" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message || err });
    }
}