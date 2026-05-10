// pages/Login.jsx

import React from "react";
import AuthLayout from "../layouts/AuthLayout";

const Login = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue"
    >
      <form className="space-y-4">
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

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;