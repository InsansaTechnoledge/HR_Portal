import Task from '../models/Task.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import mongoose from 'mongoose';

// Helper function to check if user is admin or superAdmin
const isAdmin = (user) => {
    return user && (user.role === 'admin' || user.role === 'superAdmin');
};

// Helper function to check if user can view task
const canViewTask = (task, user) => {
    // Admins and accountants can view all tasks
    if (isAdmin(user) || (user && user.role === 'accountant')) {
        return true;
    }

    if (!task || !task.assignedTo) return false;

    // Check if user is assigned to the task
    return task.assignedTo.some(assignee =>
        assignee.assigneeId && assignee.assigneeId.toString() === String(user._id)
    );
};

// Create a new task (Admin/SuperAdmin only)
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, assignedTo, dueDate, tags, status} = req.body;
        const currentUser = req.user;  // User is attached by auth middleware checkCookies
        // Verify user is admin or superAdmin
        // if (!isAdmin(currentUser)) {
        //     return res.status(403).json({ message: 'Only admins and super admins can create tasks' });
        // }

        // Validate required fields
        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        if (!assignedTo || assignedTo.length === 0) {
            return res.status(400).json({ message: 'At least one assignee is required' });
        }

        // Validate and populate assignees
        const validatedAssignees = [];
        for (const assignee of assignedTo) {
            const { assigneeType, assigneeId } = assignee;

            if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
                return res.status(400).json({ message: `Invalid assignee ID: ${assigneeId}` });
            }

            let assigneeData;
            if (assigneeType === 'User') {
                assigneeData = await User.findById(assigneeId);
                if (!assigneeData) {
                    return res.status(404).json({ message: `User not found: ${assigneeId}` });
                }
                validatedAssignees.push({
                    assigneeType: 'User',
                    assigneeId: assigneeData._id,
                    assigneeName: assigneeData.userName,
                    assigneeEmail: assigneeData.userEmail
                });
            } else if (assigneeType === 'Employee') {
                assigneeData = await Employee.findById(assigneeId);
                if (!assigneeData) {
                    return res.status(404).json({ message: `Employee not found: ${assigneeId}` });
                }
                validatedAssignees.push({
                    assigneeType: 'Employee',
                    assigneeId: assigneeData._id,
                    assigneeName: assigneeData.name,
                    assigneeEmail: assigneeData.email
                });
            } else {
                return res.status(400).json({ message: `Invalid assignee type: ${assigneeType}` });
            }
        }

        // Create task
        const newTask = new Task({
            title,
            description,
            priority: priority || 'Medium',
            status: status || 'Pending',
            assignedTo: validatedAssignees,
            assignedBy: {
                userId: currentUser._id,
                userName: currentUser.userName,
                userEmail: currentUser.userEmail
            },
            dueDate: dueDate ? new Date(dueDate) : null,
            tags: tags || []
        });

        const savedTask = await newTask.save();
        res.status(201).json({ message: 'Task created successfully', task: savedTask });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ message: err.message || 'Failed to create task' });
    }
};

// Get all tasks with role-based filtering
export const getAllTasks = async (req, res) => {
    try {
        const currentUser = req.user;
        const { status, priority, assigneeId, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build filter query
        let filter = {};

        // Role-based filtering
        if (!isAdmin(currentUser) && currentUser.role !== 'accountant') {
            // Regular users can only see tasks assigned to them
            // Try to find matching employee by email or by user ID
            // First, check if there's a direct match by user ID
            filter['assignedTo.assigneeId'] = currentUser._id;
            
            // Also try to find employee with matching email
            const matchingEmployee = await Employee.findOne({ email: currentUser.userEmail });

            if (matchingEmployee) {
                // If employee found, modify filter to include both user ID and employee ID
                filter = {
                    $or: [
                        { 'assignedTo.assigneeId': currentUser._id },
                        { 'assignedTo.assigneeId': matchingEmployee._id }
                    ]
                };
                // console.log('Filter with $or:', JSON.stringify(filter));
            } else {
                // console.log('No matching employee found by email');
            }
        } else {
            // console.log('User is admin/accountant, showing all tasks');
        }

        // Apply additional filters
        if (status) {
            filter.status = status;
        }
        if (priority) {
            filter.priority = priority;
        }
        if (assigneeId) {
            // console.log('AssigneeId filter provided:', assigneeId);
            // If there's already a role-based filter (for non-admin users), merge the assigneeId filter
            if (filter.$or) {
                // Add assigneeId to existing $or filter
                filter = {
                    $and: [
                        { $or: filter.$or },
                        { 'assignedTo.assigneeId': assigneeId }
                    ]
                };
            } else {
                filter['assignedTo.assigneeId'] = assigneeId;
            }
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // console.log('Final filter:', JSON.stringify(filter));

        // Pagination
        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);
        const skip = (pageNum - 1) * limitNum;

        // Sort
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const tasks = await Task.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalTasks = await Task.countDocuments(filter);

        // console.log('Tasks found:', tasks.length);
        // console.log('Tasks:', tasks.map(t => ({ id: t._id, title: t.title, assignedTo: t.assignedTo })));

        res.status(200).json({
            message: 'Tasks fetched successfully',
            tasks,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalTasks / limitNum),
                totalTasks,
                limit: limitNum
            }
        });
    } catch (err) {
        console.error('Get all tasks error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch tasks' });
    }
};

// Get task by ID
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const task = await Task.findById(id).lean();

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user has permission to view
        const isAssignee = task.assignedTo.some(assignee =>
            assignee.assigneeId.toString() === currentUser._id.toString()
        );

        if (!isAdmin(currentUser) && currentUser.role !== 'accountant' && !isAssignee) {
            return res.status(403).json({ message: 'You do not have permission to view this task' });
        }

        res.status(200).json({ message: 'Task fetched successfully', task });
    } catch (err) {
        console.error('Get task by ID error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch task' });
    }
};

// Update task
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions
        const isAssignee = task.assignedTo.some(assignee =>
            assignee.assigneeId.toString() === currentUser._id.toString()
        );

        if (!isAdmin(currentUser) && !isAssignee) {
            return res.status(403).json({ message: 'You do not have permission to update this task' });
        }

        // Determine what can be updated based on role
        if (isAdmin(currentUser)) {
            // Admins can update everything
            Object.keys(updates).forEach(key => {
                if (key !== '_id' && key !== 'taskId' && key !== 'createdAt' && key !== 'updatedAt') {
                    task[key] = updates[key];
                }
            });

            // Handle assignee updates if provided
            if (updates.assignedTo) {
                const validatedAssignees = [];
                for (const assignee of updates.assignedTo) {
                    const { assigneeType, assigneeId } = assignee;

                    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
                        return res.status(400).json({ message: `Invalid assignee ID: ${assigneeId}` });
                    }

                    let assigneeData;
                    if (assigneeType === 'User') {
                        assigneeData = await User.findById(assigneeId);
                        if (!assigneeData) {
                            return res.status(404).json({ message: `User not found: ${assigneeId}` });
                        }
                        validatedAssignees.push({
                            assigneeType: 'User',
                            assigneeId: assigneeData._id,
                            assigneeName: assigneeData.userName,
                            assigneeEmail: assigneeData.userEmail
                        });
                    } else if (assigneeType === 'Employee') {
                        assigneeData = await Employee.findById(assigneeId);
                        if (!assigneeData) {
                            return res.status(404).json({ message: `Employee not found: ${assigneeId}` });
                        }
                        validatedAssignees.push({
                            assigneeType: 'Employee',
                            assigneeId: assigneeData._id,
                            assigneeName: assigneeData.name,
                            assigneeEmail: assigneeData.email
                        });
                    }
                }
                task.assignedTo = validatedAssignees;
            }
        } else {
            // Regular users can only update status
            if (updates.status) {
                task.status = updates.status;

                // Set completed date if status is Completed
                if (updates.status === 'Completed' && !task.completedDate) {
                    task.completedDate = new Date();
                }
            }
        }

        const updatedTask = await task.save();
        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ message: err.message || 'Failed to update task' });
    }
};

// Delete task (Admin/SuperAdmin only)
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        if (!isAdmin(currentUser)) {
            return res.status(403).json({ message: 'Only admins and super admins can delete tasks' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ message: err.message || 'Failed to delete task' });
    }
};

// Add comment to task
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const currentUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user can view task (and thus comment)
        const isAssignee = task.assignedTo.some(assignee =>
            assignee.assigneeId.toString() === currentUser._id.toString()
        );

        if (!isAdmin(currentUser) && currentUser.role !== 'accountant' && !isAssignee) {
            return res.status(403).json({ message: 'You do not have permission to comment on this task' });
        }

        // Add comment
        task.comments.push({
            user: currentUser._id,
            userName: currentUser.userName,
            text: text.trim()
        });

        const updatedTask = await task.save();
        res.status(201).json({ message: 'Comment added successfully', task: updatedTask });
    } catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ message: err.message || 'Failed to add comment' });
    }
};

// Update comment on task
export const updateComment = async (req, res) => {
    try {
        const { id, commentIndex } = req.params;
        const { text } = req.body;
        const currentUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        if (!commentIndex || isNaN(commentIndex)) {
            return res.status(400).json({ message: 'Invalid comment index' });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = task.comments[commentIndex];

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the comment author or admin
        if (comment.user.toString() !== currentUser._id.toString() && !isAdmin(currentUser)) {
            return res.status(403).json({ message: 'You do not have permission to update this comment' });
        }

        // Update comment
        task.comments[commentIndex].text = text.trim();
        task.comments[commentIndex].createdAt = new Date();

        const updatedTask = await task.save();
        res.status(200).json({ message: 'Comment updated successfully', task: updatedTask });
    } catch (err) {
        console.error('Update comment error:', err);
        res.status(500).json({ message: err.message || 'Failed to update comment' });
    }
};

// Delete comment from task
export const deleteComment = async (req, res) => {
    try {
        const { id, commentIndex } = req.params;
        const currentUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        if (!commentIndex || isNaN(commentIndex)) {
            return res.status(400).json({ message: 'Invalid comment index' });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = task.comments[commentIndex];

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the comment author or admin
        if (comment.user.toString() !== currentUser._id.toString() && !isAdmin(currentUser)) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        // Remove comment
        task.comments.splice(commentIndex, 1);

        const updatedTask = await task.save();
        res.status(200).json({ message: 'Comment deleted successfully', task: updatedTask });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ message: err.message || 'Failed to delete comment' });
    }
};

// Get task statistics (for dashboard)
export const getTaskStats = async (req, res) => {
    try {
        const currentUser = req.user;

        let filter = {};

        // Role-based filtering
        if (!isAdmin(currentUser) && currentUser.role !== 'accountant') {
            filter['assignedTo.assigneeId'] = currentUser._id;
        }

        const stats = await Task.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await Task.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Count overdue tasks
        const overdueTasks = await Task.countDocuments({
            ...filter,
            dueDate: { $lt: new Date() },
            status: { $nin: ['Completed', 'Cancelled'] }
        });

        res.status(200).json({
            message: 'Task statistics fetched successfully',
            stats: {
                byStatus: stats,
                byPriority: priorityStats,
                overdue: overdueTasks
            }
        });
    } catch (err) {
        console.error('Get task stats error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch task statistics' });
    }
};
