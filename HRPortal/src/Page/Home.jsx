import React from "react";
import Sidebar from "../Components/Login/Sidebar";
import {
    IconArrowWaveRightUp,
    IconBoxAlignRightFilled,
    IconBoxAlignTopLeft,
    IconClipboardCopy,
    IconFileBroken,
    IconSignature,
    IconTableColumn,
} from "@tabler/icons-react";

// Grid Component
const FeatureGrid = () => (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 py-16 text-white">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-extrabold tracking-tight">
                    Insansa's HR Portal
                </h2>
                <p className="mt-4 text-lg md:text-xl text-gray-200">
                    Explore Inside Requirements and Manage Workforce Effectively
                </p>
            </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {items.map((item, i) => (
                <FeatureCard
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    icon={item.icon}
                    className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                />
            ))}
        </div>
    </div>
);

// Feature Card Component
const FeatureCard = ({ title, description, header, icon, className }) => (
    <div
        className={`p-6 bg-white rounded-lg shadow transform transition-transform duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
        <div className="flex items-center mb-4 text-indigo-500">{icon}</div>
        {header}
        <h3 className="text-xl font-semibold text-gray-900 mt-4">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </div>
);
// Skeleton Placeholder
const Skeleton = () => (
    <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"></div>
);

// Feature Items
const items = [
    {
        title: "Employee Docs Management",
        description: "Explore the birth of groundbreaking ideas and inventions.",
        header: <Skeleton />,
        icon: <IconClipboardCopy className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "Talent Management",
        description: "Dive into the transformative power of technology.",
        header: <Skeleton />,
        icon: <IconFileBroken className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "Post Current Job Openings",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton />,
        icon: <IconSignature className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "Job Application Management",
        description: "Understand the impact of effective communication in our lives.",
        header: <Skeleton />,
        icon: <IconTableColumn className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "Authentication Management",
        description: "Join the quest for understanding and enlightenment.",
        header: <Skeleton />,
        icon: <IconArrowWaveRightUp className="h-6 w-6 text-indigo-500" />,
    },
];

// Home Page Component with Sidebar
export function Home() {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <FeatureGrid />
            </div>
        </div>
    );
}

export default Home;
