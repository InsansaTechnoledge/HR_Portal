import React from "react";
import { IconClipboardCopy, IconSignature } from "@tabler/icons-react";
import emp_doc_man from "/images/emp_doc_man.png";
import job_open from "/images/job_open.png";
import job_app from "/images/job_app.png";
import leave_tr from "/images/leave_tr.png";
import cand_reg from "/images/cand_reg.png";
import cand_ros from "/images/cand_ros.png";
import auth from "/images/auth.png";
import Skeleton from "../Components/Skeleton/Skeleton"; // Assuming Skeleton is in the same folder
import FeatureGrid from "../Components/FeatureComponents/FeatureGrid"; // Assuming FeatureGrid is in the same folder

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
    },
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
    },
];

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
    },
];

// Home Page Component
function Home() {
    return (
        <div className="flex-1 overflow-y-auto">
            <FeatureGrid 
                appItems={appItems} 
                talentItems={talentItems} 
                authenticationItems={authenticationItems} 
            />
        </div>
    );
}

export default Home;
