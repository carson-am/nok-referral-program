"use client";

import * as React from "react";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);
  const { invalid: _omitInvalid, ...restFieldState } = fieldState as typeof fieldState & { invalid?: boolean };

  if (!fieldContext.name) {
    return {
      id: "",
      name: "",
      formItemId: "",
      formDescriptionId: "",
      formMessageId: "",
      invalid: false,
      ...restFieldState,
    };
  }

  return {
    ...restFieldState,
    id: `${itemContext?.id ?? fieldContext.name}-form-item`,
    name: fieldContext.name,
    formItemId: `${itemContext?.id ?? fieldContext.name}-form-item`,
    formDescriptionId: `${itemContext?.id ?? fieldContext.name}-form-item-description`,
    formMessageId: `${itemContext?.id ?? fieldContext.name}-form-item-message`,
    invalid: !!fieldState?.error,
  };
}

const FormItemContext = React.createContext<{ id: string } | null>(null);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { formItemId, invalid } = useFormField();
  return (
    <Label
      data-slot="form-label"
      className={cn(invalid && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ className, ...props }: React.ComponentProps<"div">) {
  const { invalid, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <div
      data-slot="form-control"
      className={cn(
        "[&_input]:rounded-xl [&_button]:rounded-xl",
        invalid && "[&_input]:border-destructive [&_button]:border-destructive",
        className,
      )}
      id={formItemId}
      aria-describedby={!invalid ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={invalid}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { formMessageId, error } = useFormField();
  const body = error?.message;
  if (!body) return null;
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
