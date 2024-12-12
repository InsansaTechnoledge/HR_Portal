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
        <h2 className="text-3xl font-bold text-gray-900 text-center">
            Insansa's HR Portal
        </h2>
        <p className="mt-4 text-center text-gray-600">
            Explore Inside reqirements.
        </p>
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
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="flex items-center mb-4">{icon}</div>
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
        title: "The Dawn of Innovation",
        description: "Explore the birth of groundbreaking ideas and inventions.",
        header: <Skeleton />,
        icon: <IconClipboardCopy className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "The Digital Revolution",
        description: "Dive into the transformative power of technology.",
        header: <Skeleton />,
        icon: <IconFileBroken className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "The Art of Design",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton />,
        icon: <IconSignature className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "The Power of Communication",
        description:
            "Understand the impact of effective communication in our lives.",
        header: <Skeleton />,
        icon: <IconTableColumn className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "The Pursuit of Knowledge",
        description: "Join the quest for understanding and enlightenment.",
        header: <Skeleton />,
        icon: <IconArrowWaveRightUp className="h-6 w-6 text-indigo-500" />,
    },
    
];


// Home Page Component with Sidebar
export function Home() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <FeatureGrid />
            </div>
        </div>
    );
}

export default Home;
