import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, Plus, ChevronDown, Edit2, Trash2, Save, MessageSquare, AlertCircle, User } from 'lucide-react';
import { userContext } from '../../Context/userContext';
import axios from 'axios';
import { useToast } from '../ui/use-toast';
import API_BASE_URL from '../../config';
// No longer importing from taskApi

const TaskForm = ({ open, onClose, onSubmit, initialTask = null, mode = 'create' }) => {
    const { user } = useContext(userContext);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        assignedTo: [],
        dueDate: '',
        tags: []
    });

    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [editingCommentIndex, setEditingCommentIndex] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [deletingCommentIndex, setDeletingCommentIndex] = useState(null);

    useEffect(() => {
        if (open) {
            fetchUsersAndEmployees();
            if (initialTask) {
                setFormData({
                    title: initialTask.title || '',
                    description: initialTask.description || '',
                    priority: initialTask.priority || 'Medium',
                    status: initialTask.status || 'Pending',
                    assignedTo: initialTask.assignedTo || [],
                    dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : '',
                    tags: initialTask.tags || []
                });
                setComments(initialTask.comments || []);
            } else {
                resetForm();
                setComments([]);
            }
        }
    }, [open, initialTask]);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            status: 'Pending',
            assignedTo: [],
            dueDate: '',
            tags: []
        });
        setTagInput('');
        setSelectedAssignee('');
    };

    const fetchUsersAndEmployees = async () => {
        try {
            // Fetch employees
            const employeesRes = await axios.get(`${API_BASE_URL}/api/employee/`, {
                params: {
                    fields: "name,empId,email,department,details.designation,details.accountNumber,details.panNumber,details.salary,details.uanNumber",
                    limit: 200
                },
            });

            // Fetch users (admins and superAdmins)
            let usersData = [];
            try {
                const usersRes = await axios.get(`${API_BASE_URL}/api/user/all-users`, {
                    params: {
                        limit: 200
                    }
                });
                if (usersRes.status === 200 || usersRes.status === 201) {
                    usersData = usersRes.data.users || [];
                }

            } catch (err) {
                console.warn('Could not fetch users:', err);
            }

            // Combine employees and users
            const combinedList = [
                ...((employeesRes.data?.employees || []).map(e => ({
                    ...e,
                    type: 'Employee',
                    displayName: e.name
                }))),
                ...(usersData.map(u => ({
                    ...u,
                    type: 'User',
                    displayName: u.userName,
                    email: u.userEmail
                })))
            ];

            if (employeesRes.status === 200 || employeesRes.status === 201) {
                setEmployees(employeesRes.data.employees || []);
                setUsers(combinedList);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);

            toast({
                title: 'Error',
                description: 'Failed to load users and employees',
                variant: 'destructive'
            });
        }
    };
    const handleAddAssignee = () => {
        if (!selectedAssignee) {
            toast({
                title: 'Error',
                description: 'Please select an assignee',
                variant: 'destructive'
            });
            return;
        }

        // Try to find in employees first
        let assigneeData = employees.find(e => e._id === selectedAssignee);
        let assigneeType = 'Employee';

        // If not found in employees, try to find in users
        if (!assigneeData) {
            assigneeData = users.find(u => u._id === selectedAssignee);
            assigneeType = 'User';
        }

        if (!assigneeData) {
            toast({
                title: 'Error',
                description: 'Selected assignee not found',
                variant: 'destructive'
            });
            return;
        }

        const newAssignee = {
            assigneeType: assigneeType,
            assigneeId: assigneeData._id,
            assigneeName: assigneeType === 'Employee' ? assigneeData.name : assigneeData.userName,
            assigneeEmail: assigneeType === 'Employee' ? assigneeData.email : assigneeData.userEmail
        };

        // Check if already added
        const alreadyAdded = formData.assignedTo.some(a => a.assigneeId === newAssignee.assigneeId);
        if (alreadyAdded) {
            toast({
                title: 'Already Added',
                description: 'This assignee is already in the list',
                variant: 'destructive'
            });
            return;
        }

        setFormData(prev => ({
            ...prev,
            assignedTo: [...prev.assignedTo, newAssignee]
        }));
        setSelectedAssignee('');
    };

    const handleRemoveAssignee = (assigneeId) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.filter(a => a.assigneeId !== assigneeId)
        }));
    };

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        if (formData.tags.includes(tagInput.trim())) return;

        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleEditComment = (index) => {
        setEditingCommentIndex(index);
        setEditingCommentText(comments[index].text);
    };

    const handleSaveComment = () => {
        if (!editingCommentText.trim()) {
            toast({
                title: 'Error',
                description: 'Comment cannot be empty',
                variant: 'destructive'
            });
            return;
        }

        // Update the comment in local state
        setComments(prev => {
            const updated = [...prev];
            updated[editingCommentIndex] = {
                ...updated[editingCommentIndex],
                text: editingCommentText
            };
            return updated;
        });

        setEditingCommentIndex(null);
        setEditingCommentText('');
        toast({
            title: 'Success',
            description: 'Comment updated. Changes will be saved when you click "Update Task"'
        });
    };

    const handleDeleteComment = () => {
        // Mark comment for deletion by removing it from local state
        setComments(prev => prev.filter((_, idx) => idx !== deletingCommentIndex));
        setDeletingCommentIndex(null);
        toast({
            title: 'Success',
            description: 'Comment deleted. Changes will be saved when you click "Update Task"'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Task title is required',
                variant: 'destructive'
            });
            return;
        }

        if (formData.assignedTo.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'At least one assignee is required',
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        try {
            const updatedFormData = {
                ...formData,
                currentUser: user.role || null,
            };
            console.log("FORM DATA: ", updatedFormData);

            // Create axios instance for this component
            const axiosInstance = axios.create({
                baseURL: API_BASE_URL,
                withCredentials: true
            });

            // Save edited/deleted comments if in edit mode
            if (mode === 'edit' && initialTask) {
                const originalCommentCount = initialTask.comments?.length || 0;
                const updatedCommentCount = comments.length;

                // Check if any comments were modified or deleted
                if (originalCommentCount !== updatedCommentCount) {
                    // Comments were deleted - delete them from backend
                    for (let i = originalCommentCount - 1; i >= updatedCommentCount; i--) {
                        try {
                            await axiosInstance.delete(`/api/task/${initialTask._id}/comment/${i}`);
                        } catch (err) {
                            console.error('Error deleting comment:', err);
                        }
                    }
                }

                // Check if any comments were edited
                if (comments.length > 0) {
                    for (let i = 0; i < comments.length; i++) {
                        if (initialTask.comments?.[i] && initialTask.comments[i].text !== comments[i].text) {
                            try {
                                await axiosInstance.put(`/api/task/${initialTask._id}/comment/${i}`, { text: comments[i].text });
                            } catch (err) {
                                console.error('Error updating comment:', err);
                            }
                        }
                    }
                }
            }

            await onSubmit(updatedFormData);
            resetForm();
            setComments([]);
            onClose();
        } catch (error) {
            console.error('Error submitting task:', error);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user && (user.role === 'admin' || user.role === 'superAdmin');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create New Task' : 'Edit Task'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter task title"
                            required
                            disabled={!isAdmin && mode === 'edit'}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter task description"
                            rows={4}
                            disabled={!isAdmin && mode === 'edit'}
                        />
                    </div>

                    {/* Priority and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <div className='relative'>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                    disabled={!isAdmin && mode === 'edit'}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>

                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <div className='relative'>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>

                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            disabled={!isAdmin && mode === 'edit'}
                        />
                    </div>

                    {/* Assignees */}
                    {isAdmin && (
                        <div>
                            <Label>Assignees *</Label>
                            <div className="space-y-2">
                                {/* Existing Assignees Display */}
                                {formData.assignedTo && formData.assignedTo.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md">
                                        {formData.assignedTo.map((assignee) => (
                                            <Badge key={assignee.assigneeId} variant="secondary" className="flex items-center gap-2 py-1.5 px-2">
                                                <span>{assignee.assigneeName}</span>
                                                <X
                                                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                                                    onClick={() => handleRemoveAssignee(assignee.assigneeId)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add Assignee */}
                                <div className="flex gap-2">
                                    <div className='relative flex-1'>
                                        <Select
                                            value={selectedAssignee}
                                            onValueChange={setSelectedAssignee}
                                        >
                                            <SelectTrigger>
                                                <SelectValue className="" placeholder="-- Select Employee --" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-64">
                                                {/* Employees Section */}
                                                {employees && employees.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                            EMPLOYEES
                                                        </div>
                                                        {employees.map(e => (
                                                            <SelectItem key={`emp-${e._id}`} value={e._id}>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <User className="w-4 h-4 text-primary" />
                                                                    </div>
                                                                    <span>{e.name} ({e.email})</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </>
                                                )}

                                                {/* Users Section */}
                                                {/* {users && users.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                            ADMINS
                                                        </div>
                                                        {users
                                                            .filter(u => u.type === 'User' && (u.role === 'admin' || u.role === 'superAdmin'))
                                                            .map(u => (
                                                                <SelectItem key={`user-${u._id}`} value={u._id}>
                                                                    <div className='flex items-center gap-2'>
                                                                        <User className="w-4 h-4 text-primary" /> 
                                                                        <span>{u.displayName} ({u.email}) - {u.role}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </>
                                                )} */}

                                                {(!employees || employees.length === 0) && (!users || users.filter(u => u.role === 'admin' || u.role === 'superAdmin').length === 0) && (
                                                    <SelectItem value="no-assignees" disabled>No assignees available</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleAddAssignee}
                                        size="sm"
                                        className="gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {isAdmin && (
                        <div>
                            <Label>Tags</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add tag"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                />
                                <Button type="button" onClick={handleAddTag} size="sm" className='gap-1'>
                                    <Plus className="w-4 h-4" />
                                    Add
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                                        {tag}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => handleRemoveTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section - Only show in edit mode */}
                    {mode === 'edit' && comments && comments.length > 0 && (
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                                <MessageSquare className="w-4 h-4" />
                                <span>Comments ({comments.length})</span>
                            </div>

                            <div className="space-y-3">
                                {comments.map((comment, idx) => (
                                    <div key={idx} className="bg-muted p-3 rounded-lg">
                                        {editingCommentIndex === idx ? (
                                            // Edit Mode
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">{comment.userName}</span>
                                                </div>
                                                <Textarea
                                                    value={editingCommentText}
                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                    rows={3}
                                                    className="bg-background text-sm"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingCommentIndex(null);
                                                            setEditingCommentText('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleSaveComment}
                                                        className="gap-1"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : deletingCommentIndex === idx ? (
                                            // Delete Confirmation Mode
                                            <div className="space-y-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                                                <div className="flex items-center gap-2 text-sm text-destructive">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="font-medium">Are you sure you want to delete this comment?</span>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setDeletingCommentIndex(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={handleDeleteComment}
                                                        className="gap-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Display Mode
                                            <>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm">{comment.userName}</span>
                                                    {(isAdmin || user._id === comment.user) && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleEditComment(idx)}
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                                onClick={() => setDeletingCommentIndex(idx)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TaskForm;
