import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    );
};

export default FeatureCard;
