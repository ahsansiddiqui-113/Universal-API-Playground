'use client';

import { useState, useId } from 'react';

interface ToolFormProps {
  fields: string[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  isLoading: boolean;
}

export default function ToolForm({ fields, onSubmit, isLoading }: ToolFormProps) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f, ''])),
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of fields) {
      if (!values[field]?.trim()) {
        errors[field] = `${field} is required`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  };

  if (fields.length === 0) {
    return (
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-gray-400 mb-4">This workflow requires no inputs.</p>
        <SubmitButton isLoading={isLoading} />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {fields.map((field) => {
        const inputId = `${formId}-${field}`;
        const hasError = Boolean(validationErrors[field]);
        return (
          <div key={field} className="flex flex-col gap-1.5">
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-gray-300 capitalize"
            >
              {field}
              <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              id={inputId}
              type="text"
              value={values[field] ?? ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={`Enter ${field}…`}
              disabled={isLoading}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${inputId}-error` : undefined}
              className={[
                'w-full rounded-lg border bg-gray-900 px-3.5 py-2.5 text-sm text-white',
                'placeholder:text-gray-600 outline-none transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                hasError
                  ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                  : 'border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
              ].join(' ')}
            />
            {hasError && (
              <p id={`${inputId}-error`} className="text-xs text-red-400">
                {validationErrors[field]}
              </p>
            )}
          </div>
        );
      })}

      <SubmitButton isLoading={isLoading} />
    </form>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
        hover:bg-indigo-500 active:bg-indigo-700 transition-colors
        disabled:opacity-60 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
          Running…
        </span>
      ) : (
        'Run Workflow'
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
