import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Components/ui/select';
import { Badge } from '../Components/ui/badge';
import { Search, ListTodo, CheckCircle2, Clock, AlertCircle, Calendar, ChevronDown } from 'lucide-react';
import { userContext } from '../Context/userContext';
import { getAllTasks, updateTask } from '../api/taskApi';
import TaskCard from '../Components/Task/TaskCard';
import TaskDetail from '../Components/Task/TaskDetail';
import { useToast } from '../Components/ui/use-toast';

const MyTasks = () => {
    const { user } = useContext(userContext);
    const { toast } = useToast();

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        fetchMyTasks();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [tasks, searchQuery, statusFilter]);

    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            // Backend automatically filters tasks for non-admin users based on their employee match
            
            const response = await getAllTasks({ limit: 100 });
            setTasks(response.tasks || []);
            calculateStats(response.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast({
                title: 'Error',
                description: 'Failed to load your tasks',
                variant: 'destructive'
            });
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

        // Sort by due date (upcoming first)
        filtered.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        setFilteredTasks(filtered);
    };

    const handleUpdateTask = async (taskData) => {
        try {
            await updateTask(selectedTask._id, taskData);
            toast({
                title: 'Success',
                description: 'Task updated successfully'
            });
            fetchMyTasks();

            // Refresh the selected task
            const updatedTask = await getAllTasks({ limit: 1 });
            if (updatedTask.tasks && updatedTask.tasks.length > 0) {
                setSelectedTask(updatedTask.tasks[0]);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update task',
                variant: 'destructive'
            });
            throw error;
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskDetail(true);
    };

    return (
        <div className="min-h-full bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">My Tasks</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your assigned tasks
                    </p>
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
                                    placeholder="Search your tasks..."
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
                                    </SelectContent>
                                </Select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading your tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No tasks have been assigned to you yet'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Overdue/Upcoming Section */}
                        {filteredTasks.some(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed') && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3 text-red-600 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Overdue Tasks
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTasks
                                        .filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed')
                                        .map((task) => (
                                            <TaskCard key={task._id} task={task} onClick={handleTaskClick} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* All Tasks */}
                        <div>
                            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                All Tasks
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTasks.map((task) => (
                                    <TaskCard key={task._id} task={task} onClick={handleTaskClick} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Task Detail Dialog */}
            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    open={showTaskDetail}
                    onClose={() => setShowTaskDetail(false)}
                    onEdit={() => { }}
                    onUpdate={handleUpdateTask}
                    onDelete={fetchMyTasks}
                />
            )}
        </div>
    );
};

export default MyTasks;
