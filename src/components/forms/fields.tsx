"use client";

import * as React from "react";

import { DatePicker } from "@/components/ui/date-picker";
import { FormMessage } from "@/components/ui/form-message";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect, type SearchSelectOption } from "@/components/ui/search-select";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

export interface FieldShellProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FieldShell({
  id,
  label,
  description,
  error,
  success,
  required,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {children}
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      {!error && success ? <FormMessage tone="success">{success}</FormMessage> : null}
    </div>
  );
}

export interface TextFieldProps extends Omit<InputProps, "id" | "error"> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  success?: string;
}

export function TextField({
  id,
  label,
  description,
  error,
  success,
  required,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      success={success}
      required={required}
      className={className}
    >
      <Input id={id} error={Boolean(error)} required={required} {...props} />
    </FieldShell>
  );
}

export function EmailField(props: TextFieldProps) {
  return <TextField type="email" autoComplete="email" {...props} />;
}

export function PhoneField(props: TextFieldProps) {
  return <TextField type="tel" autoComplete="tel" inputMode="tel" {...props} />;
}

export function PasswordField(props: TextFieldProps) {
  return <TextField type="password" autoComplete="current-password" {...props} />;
}

export interface TextareaFieldProps extends Omit<TextareaProps, "id" | "error"> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  success?: string;
}

export function TextareaField({
  id,
  label,
  description,
  error,
  success,
  required,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      success={success}
      required={required}
      className={className}
    >
      <Textarea id={id} error={Boolean(error)} required={required} {...props} />
    </FieldShell>
  );
}

export interface DropdownFieldProps {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownField({
  id,
  label,
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  description,
  error,
  required,
  disabled,
  className,
}: DropdownFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} aria-invalid={Boolean(error) || undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export interface AutocompleteFieldProps {
  id: string;
  label: string;
  options: SearchSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AutocompleteField({
  id,
  label,
  options,
  value,
  onValueChange,
  placeholder,
  description,
  error,
  required,
  disabled,
  className,
}: AutocompleteFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <SearchSelect
        id={id}
        options={options}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
      />
    </FieldShell>
  );
}

export function SearchSelectField(props: AutocompleteFieldProps) {
  return <AutocompleteField {...props} />;
}

export interface DateFieldProps {
  id: string;
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DateField({
  id,
  label,
  value,
  onChange,
  description,
  error,
  required,
  disabled,
  className,
}: DateFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </FieldShell>
  );
}

export interface TimeFieldProps {
  id: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TimeField({
  id,
  label,
  value,
  onChange,
  description,
  error,
  required,
  disabled,
  className,
}: TimeFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <TimePicker
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </FieldShell>
  );
}
