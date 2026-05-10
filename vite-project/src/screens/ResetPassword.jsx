// pages/ResetPassword.jsx

import React from "react";
import AuthLayout from "../layouts/AuthLayout";

const ResetPassword = () => {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new password"
    >
      <form className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-3 rounded-lg"
        />

        <button className="w-full bg-purple-600 text-white p-3 rounded-lg">
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;