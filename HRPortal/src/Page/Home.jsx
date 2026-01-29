import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../Context/userContext';
import { Card, CardContent } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import {
  Users,
  FileText,
  Briefcase,
  Calendar,
  UserPlus,
  Shield,
  FolderOpen,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ReceiptIndianRupee,
  NotebookPen,
  Receipt,
  FileSearch,
  FilePlus,
  ListTodo
} from 'lucide-react';

const FeatureCard = ({ icon, title, description, path, color, gradient }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer card-hover border-0 overflow-hidden"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-6">
        <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <div className="text-primary-foreground">{icon}</div>
        </div>
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Open</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ icon, label, value, change, color }) => (
  <Card className="border-0 shadow-card">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-xs mt-1 ${color}`}>{change}</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const Home = () => {
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  const getCategories = () => {
    if (!user) return [];

    if (user.role === 'user') {
      return [
        {
          title: 'Employee Services',
          items: [
            {
              icon: <Users className="h-6 w-6" />,
              title: 'Employee Information',
              description: 'Your personal & professional details',
              path: '/user-profile',
              color: 'text-hr-indigo',
              gradient: 'bg-gradient-to-br from-hr-indigo to-hr-purple',
            },
            {
              icon: <FolderOpen className="h-6 w-6" />,
              title: 'Employee Documents',
              description: 'Documentation and records',
              path: '/docs',
              color: 'text-info',
              gradient: 'bg-gradient-to-br from-info to-primary',
            },
            {
              icon: <ListTodo className="h-6 w-6" />,
              title: 'My Task',
              description: 'View your Daily Task',
              path: '/my-tasks',
              color: 'text-success',
              gradient: 'bg-gradient-to-br from-success to-hr-amber',
            },
            {
              icon: <Calendar className="h-6 w-6" />,
              title: 'Leave Tracker',
              description: 'Track and request leaves',
              path: '/leave-tracker',
              color: 'text-success',
              gradient: 'bg-gradient-to-br from-success to-hr-teal',
            },
            {
              icon: <FileText className="h-6 w-6" />,
              title: 'Employee Payslip',
              description: 'View your payslips',
              path: '/payslip-tracker',
              color: 'text-hr-amber',
              gradient: 'bg-gradient-to-br from-hr-amber to-warning',
            },
            {
              icon: <ReceiptIndianRupee className="h-6 w-6" />,
              title: 'Add Expense',
              description: 'Add your expenses',
              path: '/add-expense',
              color: 'text-destructive',
              gradient: 'bg-gradient-to-br from-destructive to-hr-amber',
            },
          ],
        },
      ];
    }

    if (user.role === 'accountant') {
      return [
        {
          title: 'Accounting',
          items: [
            {
              icon: <ClipboardList className="h-6 w-6" />,
              title: 'Employee Details',
              description: 'All employee information',
              path: '/emp-list',
              color: 'text-hr-purple',
              gradient: 'bg-gradient-to-br from-hr-purple to-hr-indigo',
            },
            {
              icon: <FileText className="h-6 w-6" />,
              title: 'Payslip Generation',
              description: 'Generate employee payslips',
              path: '/payslip',
              color: 'text-destructive',
              gradient: 'bg-gradient-to-br from-destructive to-hr-coral',
            },
            {
              icon: <Briefcase className="h-6 w-6" />,
              title: 'Payslip Tracker',
              description: 'Track payslip history',
              path: '/payslip-tracker',
              color: 'text-hr-amber',
              gradient: 'bg-gradient-to-br from-hr-amber to-warning',
            },

            {
              icon: <NotebookPen className="h-6 w-6" />,
              title: 'Expense Tracker',
              description: 'Track Employee Expense',
              path: '/expense-tracker',
              color: 'text-hr-amber',
              gradient: 'bg-gradient-to-br from-hr-amber to-warning',
            },

            {
              icon: <ReceiptIndianRupee className="h-6 w-6" />,
              title: 'Expense Generator',
              description: 'Generate Expense Slip',
              path: '/expense',
              color: 'text-hr-amber',
              gradient: 'bg-gradient-to-br from-hr-amber to-warning',
            },
          ],
        },
      ];
    }

    // Admin / SuperAdmin
    const categories = [
      {
        title: 'Recruitment',
        items: [
          {
            icon: <Users className="h-6 w-6" />,
            title: 'Employee Information',
            description: 'Employee profiles and details',
            path: '/user-profile',
            color: 'text-destructive',
            gradient: 'bg-gradient-to-br from-destructive to-hr-coral',
          },
          {
            icon: <Briefcase className="h-6 w-6" />,
            title: 'Job Postings',
            description: 'Create and manage openings',
            path: '/post-job',
            color: 'text-hr-purple',
            gradient: 'bg-gradient-to-br from-hr-purple to-hr-indigo',
          },
          {
            icon: <ClipboardList className="h-6 w-6" />,
            title: 'Applications',
            description: 'Review job applications',
            path: '/application',
            color: 'text-hr-amber',
            gradient: 'bg-gradient-to-br from-hr-amber to-warning',
          },
        ],
      },
      {
        title: 'Talent Management',
        items: [
          {
            icon: <UserPlus className="h-6 w-6" />,
            title: 'Candidate Registration',
            description: 'Register new candidates',
            path: '/register-candidate',
            color: 'text-pink-500',
            gradient: 'bg-gradient-to-br from-pink-500 to-hr-coral',
          },
          {
            icon: <Users className="h-6 w-6" />,
            title: 'Candidate Roster',
            description: 'Manage candidate database',
            path: '/candidate-detail',
            color: 'text-hr-indigo',
            gradient: 'bg-gradient-to-br from-hr-indigo to-hr-purple',
          },
        ],
      },

      {
        title: 'Task Management',
        items: [
          {
            icon: <ListTodo className="h-6 w-6" />,
            title: 'Task Manager',
            description: 'Employee Task Assignment',
            path: '/task-management',
            color: 'text-destructive',
            gradient: 'bg-gradient-to-br from-destructive to-hr-amber',
          },
        ],
      },

      {
        title: 'Payslip Management',
        items: [
          {
            icon: <FileText className="h-6 w-6" />,
            title: 'Payslip Tracker',
            description: 'Track Employee Payslips',
            path: '/payslip-tracker',
            color: 'text-destructive',
            gradient: 'bg-gradient-to-br from-destructive to-hr-coral',
          },
        ],
      },
      {
        title: 'Expense Management',
        items: [
          {
            icon: <ReceiptIndianRupee className="h-6 w-6" />,
            title: 'Expense Tracker',
            description: 'Track Employee Expense',
            path: '/expense-tracker',
            color: 'text-destructive',
            gradient: 'bg-gradient-to-br from-destructive to-hr-amber',
          },

        ],
      },


      {
        title: 'AI Features',
        items: [
          {
            icon: <FileSearch className="h-6 w-6" />,
            title: 'Resume Analyzer',
            description: 'Analyze Resumes',
            path: '/resume-analyzer',
            color: 'text-destructive',
            gradient: 'bg-gradient-to-br from-hr-purple to-hr-amber',
          },
        ],
      },

      {
        title: 'Administration',
        items: [
          {
            icon: <Shield className="h-6 w-6" />,
            title: 'Authentication',
            description: 'User access & permissions',
            path: '/auth',
            color: 'text-destructive',
            gradient: 'bg-gradient-to-br from-destructive to-hr-coral',
          },
        ],
      },
    ];

    // if(user.role === 'admin'){
    //   categories[2].items.push(
    //     {
    //       icon: <Receipt className="h-6 w-6" />,
    //       title: 'Payslip Generator',
    //       description: 'Generate Employee Payslips',
    //       path: '/payslip',
    //       color: 'text-hr-purple',
    //       gradient: 'bg-gradient-to-br from-hr-purple to-hr-indigo',
    //     }
    //   )
    // }

    if (user.role === 'superAdmin') {
      categories[4].items.push(
        {
          icon: <FilePlus className="h-6 w-6" />,
          title: 'Expense Generator',
          description: 'Generate Employee Expense',
          path: '/expense-tracker',
          color: 'text-destructive',
          gradient: 'bg-gradient-to-br from-destructive to-hr-coral',
        },
      );

      categories[3].items.push(
        {
          icon: <Receipt className="h-6 w-6" />,
          title: 'Payslip Generator',
          description: 'Generate Employee Payslips',
          path: '/payslip',
          color: 'text-hr-purple',
          gradient: 'bg-gradient-to-br from-hr-purple to-hr-indigo',
        }
      );
    }
    if (user.role === 'superAdmin') {
      categories[0].items.push(
        {
          icon: <ClipboardList className="h-6 w-6" />,
          title: 'Employee Details',
          description: 'All employee information',
          path: '/emp-list',
          color: 'text-hr-purple',
          gradient: 'bg-gradient-to-br from-hr-purple to-hr-indigo',
        },
      );
    }

    return categories;
  };

  const categories = getCategories();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <Card className="border-0 bg-gradient-to-r from-hr-navy via-hr-navy-light to-hr-navy overflow-hidden relative">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-hr-amber/10 rounded-full blur-2xl" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-primary font-medium mb-1">Welcome back,</p>
                  <h1 className="text-3xl font-bold text-primary-foreground mb-2">{user?.userName}</h1>
                  <p className="text-sidebar-foreground/70 max-w-lg">
                    Your personalized dashboard for managing workforce operations. Everything you need is just a click away.
                  </p>
                </div>
                {/* <div className="flex flex-wrap gap-2">
                  <Button variant="glass" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                    <Clock className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          <StatCard
            icon={<Users className="w-5 h-5 text-primary" />}
            label="Total Employees"
            value="248"
            change="+12% from last month"
            color="text-success"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-hr-amber" />}
            label="Pending Requests"
            value="16"
            change="5 urgent"
            color="text-hr-amber"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-success" />}
            label="Approved Today"
            value="8"
            change="All processed"
            color="text-success"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-hr-purple" />}
            label="Productivity"
            value="94%"
            change="+3% this week"
            color="text-success"
          />
        </div> */}

        {/* Feature Cards by Category */}
        <div className="space-y-10 stagger-children">
          {categories.map((category, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold">{category.title}</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {category.items.map((item, i) => (
                  <FeatureCard key={i} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
