import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import type { Customer, CustomerInput, CustomerStatus } from "../types";

interface CustomerFormProps {
  initial?: Customer;
  onSubmit: (input: CustomerInput) => Promise<void>;
  onCancel: () => void;
}

type FormErrors = Partial<Record<keyof CustomerInput, string>>;

const statuses: CustomerStatus[] = ["Lead", "Active", "Inactive"];

export default function CustomerForm({ initial, onSubmit, onCancel }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerInput>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    company: initial?.company ?? "",
    status: initial?.status ?? "Lead",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value } as CustomerInput);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!/^[+\d\s()-]{7,}$/.test(form.phone)) next.phone = "Enter a valid phone number";
    if (!form.company.trim()) next.company = "Company is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <Field label="Full name" name="name" value={form.name} error={errors.name} onChange={handleChange} />
      <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} />
      <Field label="Phone" name="phone" value={form.phone} error={errors.phone} onChange={handleChange} />
      <Field label="Company" name="company" value={form.company} error={errors.company} onChange={handleChange} />
      <label>
        Status
        <select name="status" value={form.status} onChange={handleChange}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Create customer"}
        </button>
      </div>
    </form>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Field({ label, error, ...inputProps }: FieldProps) {
  return (
    <label>
      {label}
      <input className="input" {...inputProps} />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
