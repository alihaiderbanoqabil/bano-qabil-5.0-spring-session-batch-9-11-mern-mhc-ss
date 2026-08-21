import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Field from "../components/Field";
import { rules } from "../utils/validators";
import { useResetPasswordMutation } from "../store/api/authApi";
import { getApiError } from "../store/api/baseApi";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { password: "", confirmPassword: "" } });

  const onSubmit = async ({ password }) => {
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success("Password updated — please log in");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiError(error, "Could not reset your password"));
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <XCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Missing reset token</h1>
        <p className="mt-2 text-sm text-slate-600">
          Open the reset link from your email, or request a new one.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-brand-600">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose something you have not used before.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Field
          label="New password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          error={errors.password}
          {...register("password", rules.password)}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...register("confirmPassword", rules.confirmPassword(getValues))}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? "Updating..." : "Update password"}
        </button>
      </form>
    </>
  );
}
