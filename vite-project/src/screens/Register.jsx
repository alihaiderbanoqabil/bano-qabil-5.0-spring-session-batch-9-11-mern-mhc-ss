// pages/Register.jsx

import React from "react";
import AuthLayout from "../layouts/AuthLayout";
import Login from "./Login";

const Register = () => {
    return (
        <AuthLayout
            title="Create Account"
            subtitle="Register to get started"
            html={<h1>Hello</h1>}
            component={<Login />}
        >
            <form className="space-y-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded-lg"
                />

                <button className="w-full bg-green-600 text-white p-3 rounded-lg">
                    Register
                </button>
            </form>
        </AuthLayout>
    );
};

export default Register;