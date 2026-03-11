import { useUnit } from 'effector-react'
import { forwardRef } from 'react'
import type { Field } from 'effector-forms'
import { Input } from '@/shared/ui/Input'

interface FormInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'onBlur' | 'error'
> {
  field: Field<string>
  name: string
}

function getTargetValue<T>(handler: (val: T) => void) {
  return (e: { target: { value: T } }) => handler(e.target.value)
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { field, name, ...rest },
  ref,
) {
  const [value, errorText] = useUnit([field.$value, field.$errorText])

  return (
    <Input
      ref={ref}
      name={name}
      value={String(value ?? '')}
      onChange={getTargetValue(field.onChange)}
      onBlur={() => field.onBlur()}
      error={errorText || undefined}
      {...rest}
    />
  )
})

export { FormInput }
