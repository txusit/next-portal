import { ZodError, boolean, z } from 'zod'

export const UUIDSchema = z.string().uuid()
export type UUIDSchema = z.infer<typeof UUIDSchema>

export const PasswordSchema = z
  .string()
  .min(6, { message: 'Must be 6 or more characters long' })
export type Password = z.infer<typeof PasswordSchema>

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(20, 'Username must be at most 20 characters long')
  .regex(
    /^[a-zA-Z0-9._]+$/,
    'Username can only contain letters, numbers, underscores, and periods'
  )
  .regex(
    /^(?!.*[_.]{2}).*$/,
    'Username cannot contain consecutive underscores or periods'
  )
  .regex(/^(?![_.]).*$/, 'Username cannot start with an underscore or period')
  .regex(/^(?!.*[_.]$).*$/, 'Username cannot end with an underscore or period')

export const SignUpSchema = z.object({
  firstName: z.string().min(1, { message: 'Must not be empty' }),
  lastName: z.string().min(1, { message: 'Must not be empty' }),
  gradYear: z.number().int(),
  username: UsernameSchema,
  email: z.string().email(),
  password: PasswordSchema,
})
export type SignUp = z.infer<typeof SignUpSchema>

export const CredentialsSchema = z.object({
  email: z.string().min(1, { message: 'Must not be empty' }),
  password: z.string().min(1, { message: 'Must not be empty' }),
})
export type Credentials = z.infer<typeof CredentialsSchema>

export const AuthorizeWithCredentialsSchema = z.object({
  hasCredentials: z.boolean(),
  credentials: CredentialsSchema,
})

export const SendPasswordResetEmailSchema = z.object({
  email: z.string().email(),
})
export type SendPasswordResetEmail = z.infer<
  typeof SendPasswordResetEmailSchema
>

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: PasswordSchema,
})
export type ResetPassword = z.infer<typeof ResetPasswordSchema>

export const SendConfirmationEmailSchema = z.object({
  email: z.string().email(),
})

export const ConfirmEmailSchema = z.object({
  token: z.string().min(1),
})

export const CheckoutSessionSchema = z.object({
  selectedPriceId: z.string().min(1),
  email: z.string().email(),
})
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>

export const GetUserAttendanceSchema = z.object({
  email: z.string().email(),
})

export const UpdateAttendanceSchema = z.object({
  email: z.string().email(),
})

export const AddMeetingSchema = z.object({
  meetingDate: z.string().datetime(),
})

export const AddPitchSchema = z.object({
  stockId: z.string().min(1),
  direction: z.enum(['long', 'short', 'hold']),
})
export type AddPitch = z.infer<typeof AddPitchSchema>

export const AddStockSchema = z.object({
  name: z.string().min(1),
  ticker: z.string().min(1).max(5),
})
export type AddStock = z.infer<typeof AddStockSchema>

export const AddVoteSchema = z.object({
  email: z.string().email(),
  direction: z.enum(['long', 'short', 'hold']),
  price: z.number().min(0),
})
export type AddVote = z.infer<typeof AddVoteSchema>
