import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { userContext } from '../../Context/userContext';
import { useContext } from 'react';

/* ---------------- helpers ---------------- */

const getPriorityColor = (priority) => {
  const colors = {
    Low: 'bg-blue-500/10 text-blue-700 border-blue-200',
    Medium: 'bg-amber-500/10 text-amber-700 border-amber-200',
    High: 'bg-orange-500/10 text-orange-700 border-orange-200',
    Critical: 'bg-red-500/10 text-red-700 border-red-200',
  };
  return colors[priority] || colors.Medium;
};

const getStatusConfig = (status) => {
  const configs = {
    Pending: {
      icon: Clock,
      color: 'bg-slate-500/10 text-slate-700 border-slate-200',
      dotColor: 'bg-slate-500',
    },
    'In Progress': {
      icon: AlertCircle,
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
    },
    Completed: {
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    Cancelled: {
      icon: XCircle,
      color: 'bg-red-500/10 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
    },
  };
  return configs[status] || configs.Pending;
};

/* ---------------- component ---------------- */

const TaskCard = ({ task, onClick, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useContext(userContext);
  /* NEW badge logic */
  const isTaskNew = () => {
    if (!task.createdAt) return false;
    const created = new Date(task.createdAt);
    const now = new Date();
    const diffInHours = (now - created) / (1000 * 60 * 60);
    return diffInHours <= 48;
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  const getDueDateInfo = () => {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const isOverdue =
      isPast(dueDate) &&
      task.status !== 'Completed' &&
      task.status !== 'Cancelled';

    return {
      isOverdue,
      daysUntilDue: differenceInDays(dueDate, new Date()),
      formatted: format(dueDate, 'MMM dd, yyyy'),
    };
  };

  const dueDateInfo = getDueDateInfo();

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(task._id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        onClick={() => onClick && onClick(task)}
        className="cursor-pointer hover:shadow-lg transition border-l-4"
        style={{
          borderLeftColor:
            task.priority === 'Critical'
              ? '#ef4444'
              : task.priority === 'High'
              ? '#f97316'
              : task.priority === 'Medium'
              ? '#eab308'
              : '#3b82f6',
        }}
      >
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-2 ">
                {isTaskNew() && (
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                )}

                <h3 className="font-semibold text-base line-clamp-2">
                    {task.title}
                </h3>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>

              {user && user.role === 'admin' || user.role === 'superAdmin' ?
                <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              :<></>}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
            <Badge variant="outline" className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {task.status}
            </Badge>
          </div>

          {/* Assignees */}
          {task.assignedTo?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={14} />
              {task.assignedTo.map((a) => a.assigneeName).join(', ')}
            </div>
          )}

          {/* Due Date */}
          {dueDateInfo && (
            <div
              className={`flex items-center gap-2 text-sm ${
                dueDateInfo.isOverdue ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              <Calendar size={14} />
              {dueDateInfo.isOverdue ? 'Overdue' : dueDateInfo.formatted}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
