import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { Bell, BellDot, X, Check, Trash2 } from "lucide-react";
import { userContext } from "../../Context/userContext";
import API_BASE_URL from "../../config";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "../../hooks/useToast";

const NotificationBell = ({ isCollapsed }) => {
    const { user } = useContext(userContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notification`, { withCredentials: true });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 1 minute for new notifications
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/notification/${id}/read`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to mark as read" });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/notification/read-all`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to mark all as read" });
        }
    };

    const handleClearAll = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/notification/clear-all`, { withCredentials: true });
            setNotifications([]);
            setUnreadCount(0);
            toast({ title: "Success", description: "All notifications cleared" });
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to clear notifications" });
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60">
                    {unreadCount > 0 ? <BellDot className="h-5 w-5 text-primary animate-pulse" /> : <Bell className="h-5 w-5" />}
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={isCollapsed ? "start" : "end"}
                side={isCollapsed ? "right" : "bottom"}
                sideOffset={isCollapsed ? 20 : 4}
                className="w-80 p-0 border-sidebar-border/50 bg-background shadow-xl rounded-xl z-[100]"
            >
                <div className="flex flex-col border-b border-sidebar-border/50 bg-muted/30">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                                onClick={handleClearAll}
                            >
                                <Trash2 className="h-3 w-3" />
                                Clear All
                            </Button>
                        )}
                    </div>
                    <div className="px-4 pb-3 flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground">
                            {unreadCount} unread
                        </p>
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-5 px-0 text-[10px] text-primary hover:text-primary hover:bg-transparent" onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n._id} className={`p-4 border-b border-sidebar-border/50 transition-colors hover:bg-muted/30 relative group ${!n.isRead ? 'bg-primary/5' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDate(n.createdAt)}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleMarkAsRead(n._id)}>
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
