import React, { useContext } from "react";
import {
    IconClipboardCopy,
    IconSignature,
} from "@tabler/icons-react";

import emp_doc_man from "/images/emp_doc_man.png"
import job_open from "/images/job_open.png"
import job_app from "/images/job_app.png"
import leave_tr from "/images/leave_tr.png"
import cand_reg from "/images/cand_reg.png"
import cand_ros from "/images/cand_ros.png"
import auth from "/images/auth.png"
import { useNavigate } from "react-router-dom";
import { userContext } from "../Context/userContext";

// Grid Component
const FeatureGrid = () => {

    const { user } = useContext(userContext);
 
    const Name = user?.userName; // fetching the name of user

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 py-16 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight">
                        Insansa's HR Portal
                    </h2>
                    <p className="mt-4 text-lg md:text-xl text-gray-200">
                        Welcome {Name}
                    </p>
                    <p className="mt-4 text-lg md:text-xl text-gray-200">
                        Explore Inside Requirements and Manage Workforce Effectively
                    </p>
                </div>
            </div>

            <h1 className="mt-10 font-extrabold text-3xl">APPLICATIONS</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {appItems.map((item, i) => (
                    user.role==="user" && (i==1 || i==2) ? null :
                    <FeatureCard
                        key={i}
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        icon={item.icon}
                        className={i === 1 || i === 2 ? "md:col-span-2" : ""}
                        nav={item.nav}
                        img={item.img}
                    />
                    
                ))}
            </div>

            {
                user.role === "user" ? null :

                    <>
                        <h1 className="mt-10 font-extrabold text-3xl">TALENT MANAGEMENT</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {talentItems.map((item, i) => (
                                <FeatureCard
                                    key={i}
                                    title={item.title}
                                    description={item.description}
                                    header={item.header}
                                    icon={item.icon}
                                    className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                                    nav={item.nav}
                                    img={item.img}
                                />
                            ))}
                        </div>

                        <h1 className="mt-10 font-extrabold text-3xl">AUTHENTICATION MANAGEMENT</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {authenticationItems.map((item, i) => (
                                <FeatureCard
                                    key={i}
                                    title={item.title}
                                    description={item.description}
                                    header={item.header}
                                    icon={item.icon}
                                    className={"md:col-span-3"}
                                    nav={item.nav}
                                    img={item.img}
                                    />
                                ))}
                        </div>
                    </>
            }
        </div>
    )   
};

// Feature Card Component
const FeatureCard = ({ title, description, header, icon, className, nav }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => { navigate(nav) }}
            className={`p-6 bg-white rounded-lg shadow transform transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:cursor-pointer ${className}`}
        >
            <div className="flex items-center mb-4 text-indigo-500">{icon}</div>
            {header}
            <h3 className="text-xl font-semibold text-gray-900 mt-4">{title}</h3>
            <p className="text-gray-600 mt-2">{description}</p>
        </div>
    )
};
// Skeleton Placeholder
const Skeleton = (props) => (
    // <div className="w-full h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <img className="w-full rounded-lg" src={props.img}></img>
);

// Feature Items
const appItems = [
    {
        title: "Employee Docs Management",
        description: "Explore the birth of groundbreaking ideas and inventions.",
        header: <Skeleton img={emp_doc_man} />,
        icon: <IconClipboardCopy className="h-6 w-6 text-indigo-500" />,
        nav: "/docs",
    },
    {
        title: "Post Current Job Openings",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton img={job_open} />,
        icon: <IconSignature className="h-6 w-6 text-indigo-500" />,
        nav: "/post-job",
    },
    {
        title: "Job Application Management",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton img={job_app} />,
        icon: <IconSignature className="h-6 w-6 text-indigo-500" />,
        nav: "/application",
    },
    {
        title: "Leave Tracker",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton img={leave_tr} />,
        icon: <IconSignature className="h-6 w-6 text-indigo-500" />,
        nav: "/leave-tracker",
    }
];

const talentItems = [
    {
        title: "Candidate Registration",
        description: "Explore the birth of groundbreaking ideas and inventions.",
        header: <Skeleton img={cand_reg} />,
        icon: <IconClipboardCopy className="h-6 w-6 text-indigo-500" />,
        nav: "/register-candidate",
    },
    {
        title: "Candidate Roster",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton img={cand_ros} />,
        icon: <IconSignature className="h-6 w-6 text-indigo-500" />,
        nav: "/candidate-detail",
        img: cand_ros
    },
]

const authenticationItems = [
    {
        title: "Authentication Management",
        description: "Discover the beauty of thoughtful and functional design.",
        header: (
            <img
                src={auth}
                className="h-64 w-full object-cover rounded-t-lg"
                alt="auth"
            />
        ),
        icon: <IconSignature className="h-5 w-5 text-indigo-500" />,
        nav: "/auth",
    }
];


// Home Page Component with Sidebar
export function Home() {
    return (

        <div className="flex-1 overflow-y-auto">
            <FeatureGrid />
        </div>
    );
}

export default Home;
