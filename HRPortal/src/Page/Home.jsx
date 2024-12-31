import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../Context/userContext';
import { Users, FileText, Briefcase, Calendar, UserPlus, Shield, ClipboardList } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(userContext);
    const navigate = useNavigate();

    const categories = [
        {
            title: 'Quick Actions',
            items: [
                {
                    icon: <FileText className="h-6 w-6" />,
                    title: 'Employee Documents',
                    description: 'Manage employee documentation and records',
                    path: '/docs',
                    color: 'bg-blue-500',
                },
                {
                    icon: <Calendar className="h-6 w-6" />,
                    title: 'Leave Tracker',
                    description: 'Track and manage employee leave requests',
                    path: '/leave-tracker',
                    color: 'bg-green-500',
                },
                {
                    icon: <Briefcase className='h-6 w-6' />,
                    title: 'Payslip Tracker',
                    description: 'Track and view your Payslips',
                    path: '/payslip-tracker',
                    color: 'bg-orange-500',
                }
            ],
        },
        ...(user.role !== 'user'
            ? [
                {
                    title: 'Recruitment',
                    items: [
                        {
                            icon: <Briefcase className="h-6 w-6" />,
                            title: 'Job Postings',
                            description: 'Create and manage job openings',
                            path: '/post-job',
                            color: 'bg-purple-500',
                        },
                        {
                            icon: <ClipboardList className="h-6 w-6" />,
                            title: 'Applications',
                            description: 'Review and manage job applications',
                            path: '/application',
                            color: 'bg-orange-500',
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
                            color: 'bg-pink-500',
                        },
                        {
                            icon: <Users className="h-6 w-6" />,
                            title: 'Candidate Roster',
                            description: 'View and manage candidate database',
                            path: '/candidate-detail',
                            color: 'bg-indigo-500',
                        },
                    ],
                },
                {
                    title: 'Administration',
                    items: [
                        {
                            icon: <Shield className="h-6 w-6" />,
                            title: 'Authentication',
                            description: 'Manage user access and permissions',
                            path: '/auth',
                            color: 'bg-red-500',
                        },
                    ],
                },
            ]
            : []),
    ].filter(Boolean);

    if(user && user.role!=='superAdmin'){
        categories[0].items.unshift({
            icon: <Users className="h-6 w-6" />,
            title: 'Employee Information',
            description: 'Your personal as well as professional details',
            path: '/emp-info',
            color: 'bg-red-500',
        })
    }

    const FeatureCard = ({ icon, title, description, path, color }) => (
        <div
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer p-6 rounded-lg bg-white border"
            onClick={() => navigate(path)}
        >
            <div
                className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Welcome, {user?.userName}</h1>
                    <p className="text-gray-600">Your personalized dashboard for managing workforce operations.</p>
                </div>

                {/* Dashboard Sections */}
                <div className="space-y-8">
                    {categories.map((category, index) => (
                        <div key={index}>
                            <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default Dashboard;
