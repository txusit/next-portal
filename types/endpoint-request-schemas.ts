import { ZodError, boolean, z } from 'zod'

export const SignUpSchema = z.object({
  firstName: z.string().nonempty({ message: 'Must not be empty' }),
  lastName: z.string().nonempty({ message: 'Must not be empty' }),
  email: z.string().email(),
  password: z.string().min(6, { message: 'Must be 6 or more characters long' }),
})
export type SignUp = z.infer<typeof SignUpSchema>

export const CredentialsSchema = z.object({
  email: z.string().nonempty({ message: 'Must not be empty' }),
  password: z.string().nonempty({ message: 'Must not be empty' }),
})
export type Credentials = z.infer<typeof CredentialsSchema>

export const AuthorizeWithCredentialsSchema = z.object({
  isValidCredentials: z.boolean(),
  credentials: CredentialsSchema,
})

export const SendPasswordResetEmailSchema = z.object({
  email: z.string().email(),
})
export type SendPasswordResetEmail = z.infer<
  typeof SendPasswordResetEmailSchema
>

export const ResetPasswordSchema = z.object({
  token: z.string().nonempty(),
  password: z.string().nonempty(),
})
export type ResetPassword = z.infer<typeof ResetPasswordSchema>

export const SendConfirmationEmailSchema = z.object({
  email: z.string().nonempty(),
})

export const ConfirmEmailSchema = z.object({
  token: z.string().nonempty(),
})

export const CheckoutSessionSchema = z.object({
  selectedPriceId: z.string().nonempty(),
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
  stockId: z.string().nonempty(),
  direction: z.enum(['long', 'short', 'hold']),
})
export type AddPitch = z.infer<typeof AddPitchSchema>

export const AddStockSchema = z.object({
  name: z.string().nonempty(),
  ticker: z.string().min(1).max(5),
})
export type AddStock = z.infer<typeof AddStockSchema>

export const AddVoteSchema = z.object({
  email: z.string().email(),
  direction: z.enum(['long', 'short', 'hold']),
  price: z.number().min(0),
})
export type AddVote = z.infer<typeof AddVoteSchema>
