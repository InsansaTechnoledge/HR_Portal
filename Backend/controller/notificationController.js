import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const email = req.user.userEmail;

        // Find linked employee ID if exists
        const emp = await Employee.findOne({ email });
        const recipientIds = [userId];
        if (emp) recipientIds.push(emp._id);

        const notifications = await Notification.find({ recipient: { $in: recipientIds } })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(notifications);
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const email = req.user.userEmail;

        const emp = await Employee.findOne({ email });
        const recipientIds = [userId];
        if (emp) recipientIds.push(emp._id);

        await Notification.updateMany(
            { recipient: { $in: recipientIds }, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const email = req.user.userEmail;

        const emp = await Employee.findOne({ email });
        const recipientIds = [userId];
        if (emp) recipientIds.push(emp._id);

        await Notification.deleteMany({ recipient: { $in: recipientIds } });
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (err) {
        console.error('deleteAllNotifications error:', err);
        res.status(500).json({ message: 'Failed to clear notifications' });
    }
};
