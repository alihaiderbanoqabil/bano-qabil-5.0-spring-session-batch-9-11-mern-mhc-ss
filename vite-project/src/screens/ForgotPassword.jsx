// pages/ForgotPassword.jsx

import React from "react";
import AuthLayout from "../layouts/AuthLayout";

const ForgotPassword = () => {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address"
    >
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg"
        />

        <button className="w-full bg-orange-500 text-white p-3 rounded-lg">
          Send Reset Link
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;