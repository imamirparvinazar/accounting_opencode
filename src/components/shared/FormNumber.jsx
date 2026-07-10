import { Controller } from 'react-hook-form'
import NumberInput from './NumberInput'

export function FormNumber({ name, control, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => <NumberInput {...field} {...props} />}
    />
  )
}
