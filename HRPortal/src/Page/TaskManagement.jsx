import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Components/ui/select';
import { Badge } from '../Components/ui/badge';
import { Plus, Search, Filter, ListTodo, CheckCircle2, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { userContext } from '../Context/userContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import TaskCard from '../Components/Task/TaskCard';
import TaskForm from '../Components/Task/TaskForm';
import TaskDetail from '../Components/Task/TaskDetail';
import { useToast } from '../Components/ui/use-toast';
import SuccessToast from '../Components/Toaster/SuccessToaser';
import ErrorToast from '../Components/Toaster/ErrorToaster';

const TaskManagement = () => {
    const { user } = useContext(userContext);
    const { toast } = useToast();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [dueDateFilter, setDueDateFilter] = useState('');

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        fetchTasks();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [tasks, searchQuery, statusFilter, priorityFilter, dueDateFilter]);

    // Create axios instance for this component
    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true
    });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/task', { params: { limit: 100 } });
            setTasks(response.data.tasks || []);
            calculateStats(response.data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setErrorMessage('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (taskList) => {
        setStats({
            total: taskList.length,
            pending: taskList.filter(t => t.status === 'Pending').length,
            inProgress: taskList.filter(t => t.status === 'In Progress').length,
            completed: taskList.filter(t => t.status === 'Completed').length
        });
    };

    const applyFilters = () => {
        let filtered = [...tasks];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(task => task.priority === priorityFilter);
        }

        // Due Date filter - Match exact date
        if (dueDateFilter) {
            const filterDate = new Date(dueDateFilter);
            filtered = filtered.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                // Compare only the date part (year, month, day)
                return taskDate.toDateString() === filterDate.toDateString();
            });
        }

        setFilteredTasks(filtered);
    };

    const handleCreateTask = async (taskData) => {
        try {
            await axiosInstance.post('/api/task', taskData);
            setSuccessMessage('Task created successfully');
            fetchTasks();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to create task');
            throw error;
        }
    };

    const handleUpdateTask = async (taskData, options = {}) => {
        const suppressToast = options.suppressToast || false;
        const keepOpen = options.keepOpen || false;
        try {
            await axiosInstance.put(`/api/task/${selectedTask._id}`, taskData);
            if (!suppressToast) {
                setSuccessMessage('Task updated successfully');
            }
            fetchTasks();
            if (!keepOpen) {
                setShowTaskDetail(false);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to update task');
            throw error;
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axiosInstance.delete(`/api/task/${taskId}`);
            setSuccessMessage('Task deleted successfully');
            fetchTasks();
            return true;
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to delete task');
            throw error;
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskDetail(true);
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setFormMode('edit');
        setShowTaskDetail(false);
        setShowTaskForm(true);
    };

    const handleCreateNew = () => {
        setSelectedTask(null);
        setFormMode('create');
        setShowTaskForm(true);
    };

    const isAdmin = user && (user.role === 'admin' || user.role === 'superAdmin');

    return (
        <div className="min-h-full bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Task Management</h1>
                        <p className="text-muted-foreground mt-1">
                            {isAdmin ? 'Manage and assign tasks to your team' : 'View and update your assigned tasks'}
                        </p>
                    </div>
                    {isAdmin && (
                        <Button onClick={handleCreateNew}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Total Tasks",
                            value: stats.total,
                            icon: ListTodo,
                            color: "text-primary",
                            bg: "bg-primary/10",
                        },
                        {
                            label: "Pending",
                            value: stats.pending,
                            icon: Clock,
                            color: "text-muted-foreground",
                            bg: "bg-gray-500/10",
                        },
                        {
                            label: "In Progress",
                            value: stats.inProgress,
                            icon: AlertCircle,
                            color: "text-orange-500",
                            bg: "bg-orange-500/10",
                        },
                        {
                            label: "Completed",
                            value: stats.completed,
                            icon: CheckCircle2,
                            color: "text-green-500",
                            bg: "bg-green-500/10",
                        },
                    ].map((stat, i) => (
                        <Card key={i} className="border-border/50 shadow-card card-hover">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {stat.label}
                                        </p>
                                        <p className="text-xl md:text-2xl font-bold text-foreground">
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className='relative'>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>

                            {/* Priority Filter */}
                            <div className='relative'>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>

                            {/* Due Date Filter */}
                            <div>
                                <Input
                                    type="date"
                                    value={dueDateFilter}
                                    onChange={(e) => setDueDateFilter(e.target.value)}
                                    className="w-full md:w-40"
                                    title="Filter tasks by due date"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter
                                    ? 'Try adjusting your filters'
                                    : isAdmin
                                        ? 'Create your first task to get started'
                                        : 'No tasks have been assigned to you yet'}
                            </p>
                            {/* {isAdmin && (
                                <Button onClick={handleCreateNew}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Task
                                </Button>
                            )} */}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={handleTaskClick}
                                onDelete={handleDeleteTask}
                                isCurrentUser={user?._id === task.assignedTo?.[0]?.assigneeId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Task Form Dialog */}
            <TaskForm
                open={showTaskForm}
                onClose={() => setShowTaskForm(false)}
                onSubmit={formMode === 'create' ? handleCreateTask : handleUpdateTask}
                initialTask={selectedTask}
                mode={formMode}
            />

            {/* Task Detail Dialog */}
            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    open={showTaskDetail}
                    onClose={() => setShowTaskDetail(false)}
                    onEdit={handleEditTask}
                    onUpdate={handleUpdateTask}
                    onDelete={fetchTasks}
                />
            )}

            {/* Toast Messages */}
            {successMessage && (
                <SuccessToast
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                />
            )}
            {errorMessage && (
                <ErrorToast
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}
        </div>
    );
};

export default TaskManagement;
