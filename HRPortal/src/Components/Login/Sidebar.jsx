import React, { useState, useEffect, useContext, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { userContext } from "../../Context/userContext";
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
// import { toast } from '../../hooks/use-toast';
import {
  Home,
  Users,
  FolderOpen,
  Calendar,
  FileText,
  Briefcase,
  ClipboardList,
  UserPlus,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building2,
  Menu,
  X,
  Key,
  Receipt,
  UserCircle,
  Sparkles,
  ReceiptIndianRupee,
  FilePlus,
  FileSearch
} from 'lucide-react';
import ErrorToast from '../Toaster/ErrorToaster';
import SuccessToast from '../Toaster/SuccessToaser';
import useLogout from "../../Context/useLogout";
import {Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from '../ui/tooltip';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/', roles: ['user', 'admin', 'superAdmin', 'accountant'] },
  { 
    icon: Users, 
    label: 'Management',
    roles: ['user'],
    children: [
      { icon: FolderOpen, label: 'Documents', path: '/docs', roles: ['user'] },
      { icon: UserCircle, label: 'My Profile', path: '/user-profile', roles: ['user'] },
      { icon: Calendar, label: 'Leave Tracker', path: '/leave-tracker', roles: ['user'] },
      { icon: FileText, label: 'Payslip Tracker', path: '/payslip-tracker', roles: ['user'] },
      { icon: Key, label: 'Change Password', path: '/change-password', roles: ['user'] },
      { icon: ReceiptIndianRupee, label: 'Add Expense', path: '/add-expense', roles: ['user']},
      { icon: FileText, label: 'Expense Tracker', path: '/expense-tracker', roles: ['user'] },
    ]
  },
  { icon: UserPlus, label: 'Employee Registration', path: '/emp-info-register', roles: ['admin', 'superAdmin'] },
  {
    icon: Settings,
    label: 'Apps',
    roles: ['admin', 'superAdmin'],
    children: [
      {
        icon: Users,
        label: 'Employee Management',
        children: [
          { icon: FolderOpen, label: 'Employee Documents', path: '/docs', roles: ['admin', 'superAdmin'] },
          { icon: Calendar, label: 'Leave Tracker', path: '/leave-tracker', roles: ['admin', 'superAdmin'] },
          { icon: UserPlus, label: 'Add Employee', path: '/add-employee', roles: ['admin', 'superAdmin'] },
          { icon: ClipboardList, label: 'Employee Details', path: '/emp-list', roles: ['superAdmin'] },
        ]
      },
      {
        icon: Briefcase,
        label: 'Job Management',
        children: [
          { icon: Briefcase, label: 'Post Job Openings', path: '/post-job', roles: ['admin', 'superAdmin'] },
          { icon: ClipboardList, label: 'Job Applications', path: '/application', roles: ['admin', 'superAdmin'] },
        ]
      }
    ]
  },
  {
    icon: UserPlus,
    label: 'Talent Management',
    roles: ['admin', 'superAdmin'],
    children: [
      { icon: UserPlus, label: 'Register Candidate', path: '/register-candidate', roles: ['admin', 'superAdmin'] },
      { icon: Users, label: 'Candidate Roster', path: '/candidate-detail', roles: ['admin', 'superAdmin'] },
    ]
  },
  {
    icon: Receipt,
    label: 'Payslip Management',
    roles: ['admin', 'superAdmin', 'accountant'],
    children: [
      { icon: FileText, label: 'PaySlip Tracker', path: '/payslip-tracker', roles: ['admin', 'superAdmin', 'accountant'] },
      { icon: Receipt, label: 'PaySlip Generator', path: '/payslip', roles: ['superAdmin', 'accountant'] },
    ]
  },

  {
        icon: ReceiptIndianRupee,
        label: 'Expense Management',
        children: [
          { icon: FileText, label: 'Expense Tracker', path: '/expense-tracker', roles: ['accountant', 'superAdmin'] },
          { icon: FilePlus, label: 'Expense Generator', path: '/expense', roles: ['accountant', 'superAdmin'] },
        ]
  },
  { icon: FileSearch, label: 'Resume Analyzer', path: '/resume-analyzer', isAI: true, roles: ['admin'] },
  { icon: Shield, label: 'Authentication', path: '/auth', roles: ['admin', 'superAdmin'] },
  { icon: ClipboardList, label: 'Employee Details', path: '/emp-list', roles: ['accountant'] },
  { icon: Calendar, label: 'Leave Tracker', path: '/leave-tracker', roles: ['accountant'] },
  { icon: Key, label: 'Change Password', path: '/change-password', roles: ['accountant'] },
];

const SidebarItem = ({
  item,
  isCollapsed,
  userRole,
  onMobileClose,
  openMenus,
  setOpenMenus,
}) => {
  const location = useLocation();
  const Icon = item.icon;

  const filteredChildren = item.children?.filter(
    child => !child.roles || child.roles.includes(userRole)
  );

  const hasChildren = filteredChildren?.length > 0;

  const isActive = item.path === location.pathname;

  const hasActiveChild = filteredChildren?.some(
    child =>
      child.path === location.pathname ||
      child.children?.some(gc => gc.path === location.pathname)
  );

  const menuKey = item.path ?? item.label;

  /* SINGLE SOURCE OF TRUTH */
  const isOpen = openMenus.has(menuKey);

  /* MANUAL TOGGLE ONLY */
  const toggleMenu = () => {
    setOpenMenus(prev => {
      const next = new Set(prev);
      next.has(menuKey) ? next.delete(menuKey) : next.add(menuKey);
      return next;
    });
  };

  /* ================= MENU WITH CHILDREN ================= */
  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={toggleMenu}
          className={cn(
            "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "hover:bg-sidebar-accent/80 text-sidebar-foreground/80 hover:text-sidebar-foreground",
            (isOpen || hasActiveChild) &&
              "bg-sidebar-accent/60 text-sidebar-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              (isOpen || hasActiveChild)
                ? "bg-sidebar-primary/20 text-sidebar-primary"
                : "group-hover:bg-sidebar-accent"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>

          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">
                {item.label}
              </span>
              <div className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-180"
              )}>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </div>
            </>
          )}
        </button>

        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
            isOpen && !isCollapsed
              ? "max-h-[1000px] opacity-100 pointer-events-auto"
              : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div className={"ml-5 mt-1 space-y-1 border-l-2 border-sidebar-border/50 pl-3"}>
            {filteredChildren.map(child => (
              <SidebarItem
                key={child.path ?? child.label}
                item={child}
                isCollapsed={isCollapsed}
                userRole={userRole}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
                onMobileClose={onMobileClose}
              />
            ))}
          </div>
        </div>

      </div>
    );
  }

  /* ================= LEAF ITEM ================= */
  if (!item.path) return null;

  return (
    <NavLink
      to={item.path}
      onClick={onMobileClose}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-lg"
            : "hover:bg-sidebar-accent/80 text-sidebar-foreground/80 hover:text-sidebar-foreground",
          isCollapsed && "justify-center px-2"
        )
      }
    >
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
          isActive ? "bg-white/20" : "group-hover:bg-sidebar-accent"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      {!isCollapsed && 
        <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {item.label}
        </span>
        {item.isAI && (
          <span className={cn(
            "ml-auto flex items-center gap-1 px-2 py-[2px] text-[10px] font-medium rounded-full translate-x-2 -translate-y-1",
            isActive
              ? "border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10"
              : "border-purple-500/30 text-purple-500 bg-purple-500/5")}
            >
            AI
          </span>
        )}
        </div>
      }
    </NavLink>
  );
};


const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState(new Set());

    const { user } = useContext(userContext);
    const { handleLogout } = useLogout();

    const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  const closeMobile = () => setIsMobileOpen(false);

  const SidebarContent = ({ isMobile = false }) => (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sidebar-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-24 h-24 bg-sidebar-primary/5 rounded-full blur-2xl" />
          <div className={cn(
            "relative flex items-center gap-3 p-4 border-b border-sidebar-border/50",
            isCollapsed && !isMobile ? "justify-center" : "justify-between"
          )}>
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center shadow-lg shadow-sidebar-primary/30">
                    <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-sidebar animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-sidebar-foreground text-sm">HR Portal</h2>
                    <Sparkles className="w-3 h-3 text-sidebar-primary" />
                  </div>
                  <p className="text-xs text-sidebar-foreground/50 truncate max-w-[120px]">
                    Welcome back
                  </p>
                </div>
              </div>
            )}
            
            {!isMobile && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 h-8 w-8"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isCollapsed ? "Expand" : "Collapse"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredNavItems.map(item => (
              <SidebarItem
                key={item.path ?? item.label}
                item={item}
                isCollapsed={isCollapsed && !isMobile}
                userRole={user?.role || "user"}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
                onMobileClose={isMobile ? closeMobile : undefined}
              />
            ))}
          </nav>

          <div className="relative p-3 border-t border-sidebar-border/50 space-y-3">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-sidebar-accent/40 to-sidebar-accent/20 backdrop-blur-sm">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 flex items-center justify-center ring-2 ring-sidebar-primary/20">
                    <span className="text-base font-bold text-sidebar-primary">
                      {user?.userName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user?.userName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {user?.role === 'superAdmin' ? 'Super Admin' : user?.role}
                  </p>
                </div>
              </div>
            )}
            
            {isCollapsed && !isMobile ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10 justify-center px-2"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-destructive">
                  Sign out
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10 justify-start gap-3 rounded-xl"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-medium">Sign out</span>
              </Button>
            )}
          </div>
      </div>
    </TooltipProvider>
    
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-sidebar border-r transition-all",
           "transition-[max-width] duration-300 ease-in-out",
          isCollapsed ? "max-w-[72px]" : "max-w-64"
        )}
      >
        <SidebarContent />
      </aside>

      <Button
        variant="default"
        size="icon"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 shadow-lg bg-primary hover:bg-primary/90"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div 
        className={cn(
          "lg:hidden fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobile}
      />

      <aside className={cn(
        "lg:hidden fixed top-0 left-0 h-full w-72 bg-sidebar z-50 shadow-2xl transition-transform duration-300 ease-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeMobile}
          className="absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
        >
          <X className="w-5 h-5" />
        </Button>
        <SidebarContent isMobile />
      </aside>
    </>
  );
};

export default Sidebar;
