/**
 * Ek input + label + error message. react-hook-form ke `register` ka natija
 * seedha spread karte hain, is liye har form mein wahi shape chalti hai:
 *   <Field label="Email" error={errors.email} {...register("email", rules.email)} />
 *
 * forwardRef ki zarorat nahi — React 19 mein `ref` normal prop ki tarah pass hota hai.
 */
export default function Field({ label, error, hint, as = "input", children, className = "", ...props }) {
  const Element = as;
  const invalid = Boolean(error);

  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}

      <Element
        {...props}
        aria-invalid={invalid}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-3 ${
          invalid
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-100"
        } ${as === "textarea" ? "min-h-24 resize-y" : ""}`}
      >
        {children}
      </Element>

      {invalid ? (
        <span className="mt-1.5 block text-xs font-medium text-rose-600">{error.message}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}
