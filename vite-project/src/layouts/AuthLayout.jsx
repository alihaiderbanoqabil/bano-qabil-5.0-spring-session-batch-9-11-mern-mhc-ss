// layouts/AuthLayout.jsx

import React from "react";

const AuthLayout = ({ title, subtitle, html, component, children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-gray-500 mt-2">
                            {subtitle}
                        </p>
                    )}

                    {html}
                    {component}
                </div>

                {/* Dynamic Screen Content */}
                {children}

            </div>
        </div>
    );
};

export default AuthLayout;