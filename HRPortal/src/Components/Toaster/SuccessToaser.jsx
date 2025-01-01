import React, { useState, useEffect } from "react";

const SuccessToast = ({ message }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3500); 

            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <>
            {isVisible && (
                <div
                    className="fixed bottom-5 right-5 flex items-center max-w-sm p-4 text-white bg-green-600 rounded-lg shadow-md animate-slide-in"
                >
                    <div className="mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Success</h3>
                        <p className="text-sm">{message || "Operation completed successfully."}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default SuccessToast;

