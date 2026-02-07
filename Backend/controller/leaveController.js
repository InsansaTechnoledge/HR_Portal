import Employee from '../models/Employee.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const hasRole = (user, roles = []) => user && roles.includes(user.role);

export const updateLeaveStatus = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!hasRole(currentUser, ['admin', 'superAdmin'])) {
            return res.status(403).json({ message: 'Not authorized to update leave status' });
        }

        const { id, leaveId, status, remarks, targetType } = req.body;

        if (currentUser._id.toString() === id.toString()) {
            return res.status(403).json({ message: 'You cannot approve or reject your own leave' });
        }

        if (!id || !leaveId || !status || !targetType) {
            return res.status(400).json({ message: 'Missing required fields: id, leaveId, status, targetType' });
        }

        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let Model;
        if (targetType === 'employee') {
            Model = Employee;
        } else if (targetType === 'user') {
            Model = User;
        } else {
            return res.status(400).json({ message: 'Invalid targetType. Must be "employee" or "user"' });
        }

        const person = await Model.findById(id);
        if (!person) {
            return res.status(404).json({ message: `${targetType} not found` });
        }

        const leave = person.leaveHistory.id(leaveId);
        if (!leave) {
            return res.status(404).json({ message: 'Leave record not found' });
        }

        leave.status = status;
        leave.statusUpdatedBy = currentUser._id;
        leave.statusUpdatedAt = new Date();
        if (remarks) leave.remarks = remarks;

        await person.save();

        // Create notification for the applicant
        try {
            const notification = new Notification({
                recipient: person._id,
                recipientType: targetType === 'employee' ? 'Employee' : 'User',
                sender: currentUser._id,
                senderType: 'User',
                type: 'LEAVE_STATUS_UPDATE',
                message: `Your leave request for ${leave.type} from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
                relatedId: leave._id
            });
            await notification.save();
        } catch (notifErr) {
            console.error('Failed to create status update notification:', notifErr);
        }

        res.status(200).json({
            message: `Leave status updated to ${status}`,
            leave
        });

    } catch (err) {
        console.error('updateLeaveStatus error:', err);
        res.status(500).json({ message: err.message || 'Failed to update leave status' });
    }
};
