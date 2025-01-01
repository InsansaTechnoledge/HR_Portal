import React, { useState, useEffect } from "react";

const ErrorToast = ({ error }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (error) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3500); 

            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <>
            {isVisible && (
                <div
                    className="fixed bottom-5 right-5 flex items-center max-w-sm p-4 text-white bg-red-600 rounded-lg shadow-md animate-slide-in"
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
                                d="M12 9v2m0 4h.01M21 12c0 4.971-4.029 9-9 9s-9-4.029-9-9 4.029-9 9-9 9 4.029 9 9z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Error</h3>
                        <p className="text-sm">{error || "An error occurred. Please try again."}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ErrorToast;
