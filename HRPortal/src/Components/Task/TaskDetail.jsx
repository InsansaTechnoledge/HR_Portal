import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar, User, Clock, Tag, MessageSquare, Paperclip, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';
import { userContext } from '../../Context/userContext';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useToast } from '../ui/use-toast';

const TaskDetail = ({ task, open, onClose, onEdit, onUpdate, onDelete }) => {
    const { user } = useContext(userContext);
    const { toast } = useToast();
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (task) {
            // Task loaded
        }
    }, [task]);

    if (!task) return null;

    const isAdmin = user && (user.role === 'admin' || user.role === 'superAdmin');
    const isAssignee = task.assignedTo?.some(a => a.assigneeId === user._id);
    const canEdit = isAdmin;

    // Create axios instance for this component
    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true
    });

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            await axiosInstance.post(`/api/task/${task._id}/comment`, { text: commentText });
            toast({
                title: 'Success',
                description: 'Comment added successfully'
            });
            setCommentText('');
            // Refresh task data without showing the global "Task updated successfully" toast and keep the dialog open
            onUpdate && onUpdate({}, { suppressToast: true, keepOpen: true });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'Failed to add comment',
                variant: 'destructive'
            });
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await axiosInstance.delete(`/api/task/${task._id}`);
            toast({
                title: 'Success',
                description: 'Task deleted successfully'
            });
            onDelete();
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.message || 'Failed to delete task',
                variant: 'destructive'
            });
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            Low: 'bg-blue-100 text-blue-800',
            Medium: 'bg-yellow-100 text-yellow-800',
            High: 'bg-orange-100 text-orange-800',
            Critical: 'bg-red-100 text-red-800'
        };
        return colors[priority] || colors.Medium;
    };

    const getDaysLeft = () => {
        if (!task.dueDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const timeDiff = dueDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return daysLeft;
    };

    const getDaysLeftColor = (daysLeft) => {
        if (daysLeft < 0) return 'text-destructive';
        if (daysLeft === 0) return 'text-orange-500';
        if (daysLeft <= 3) return 'text-orange-500';
        return 'text-green-500';
    };

    const getDaysLeftText = (daysLeft) => {
        if (daysLeft < 0) return `${Math.abs(daysLeft)} day(s) overdue`;
        if (daysLeft === 0) return 'Due today';
        if (daysLeft === 1) return '1 day left';
        return `${daysLeft} days left`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className='flex gap-2 items-center justify-baseline'>
                                <DialogTitle className="text-2xl mb-2">{task.title}</DialogTitle>
                                {canEdit && (
                                    <Button size="icon" variant="ghost" onClick={() => onEdit(task)} title="Edit Task">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                </Badge>
                                <Badge variant="outline">Task #{task.taskId}</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* {canDelete && (
                                <Button size="icon" variant="ghost" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            )} */}
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Status Display */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            {/* <Badge variant="outline" className="text-base py-1.5 px-3">
                                {task.status}
                            </Badge> */}
                            <p className="text-muted-foreground whitespace-pre-wrap">{task.status}</p>
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                            </div>
                        )}

                        <Separator />

                        {/* Task Details */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Assigned To */}
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <User className="w-4 h-4" />
                                    <span>Assigned To</span>
                                </div>
                                <div className="space-y-1">
                                    {task.assignedTo?.map((assignee, idx) => (
                                        <div key={idx} className="text-sm text-muted-foreground">
                                            {assignee.assigneeName} ({assignee.assigneeEmail})
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Assigned By */}
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <User className="w-4 h-4" />
                                    <span>Assigned By</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {task.assignedBy?.userName}
                                </div>
                            </div>

                            {/* Due Date */}
                            {task.dueDate && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Due Date</span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            {format(new Date(task.dueDate), 'PPP')}
                                        </div>
                                        {getDaysLeft() !== null && (
                                            <div className={`text-sm font-medium mt-1 ${getDaysLeftColor(getDaysLeft())}`}>
                                                {getDaysLeftText(getDaysLeft())}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Created At */}
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Created</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {format(new Date(task.createdAt), 'PPP')}
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <Tag className="w-4 h-4" />
                                    <span>Tags</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {task.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Comments Section */}
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-4">
                                <MessageSquare className="w-4 h-4" />
                                <span>Comments ({task.comments?.length || 0})</span>
                            </div>

                            {/* Existing Comments */}
                            <div className="space-y-3 mb-4">
                                {task.comments && task.comments.length > 0 ? (
                                    task.comments.map((comment, idx) => (
                                        <div key={idx} className="bg-muted p-3 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">{comment.userName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(comment.createdAt), 'PPp')}
                                                </span>
                                            </div>
                                            <p className="text-sm">{comment.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No comments yet</p>
                                )}
                            </div>

                            {/* Add Comment */}
                            {isAdmin &&
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        rows={3}
                                    />
                                    <Button
                                        onClick={handleAddComment}
                                        disabled={submittingComment || !commentText.trim()}
                                        size="sm"
                                    >
                                        {submittingComment ? 'Adding...' : 'Add Comment'}
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetail;
