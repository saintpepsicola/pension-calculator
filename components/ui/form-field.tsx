import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormFieldProps } from "@/lib/types"

export function FormField({
  id,
  label,
  type,
  placeholder,
  registration,
  error,
  min,
  max,
  prefix,
  maxLength,
  pattern,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type={type}
          {...registration}
          className={prefix ? "pl-8" : "bg"}
          placeholder={placeholder}
          min={min}
          max={max}
          required
          maxLength={maxLength}
          pattern={pattern}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  )
}
