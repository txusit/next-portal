import { InputError } from '@/types/error'

export const getErrorMsg = (key: string, errors: InputError[]) => {
  if (errors.find((err) => err.hasOwnProperty(key) !== undefined)) {
    const errorObj = errors.find((err) => err.hasOwnProperty(key))
    return errorObj && errorObj[key]
  }
}
