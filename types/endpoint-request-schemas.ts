import { ZodError, boolean, z } from 'zod'
import {
  EmailSchema,
  GradYearSchema,
  NameSchema,
  PasswordSchema,
  TokenSchema,
  UsernameSchema,
} from './common-schemas'

export const SignUpSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  gradYear: GradYearSchema,
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
})
export type SignUp = z.infer<typeof SignUpSchema>

export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})
export type Credentials = z.infer<typeof CredentialsSchema>

export const AuthorizeWithCredentialsSchema = z.object({
  hasCredentials: z.boolean(),
  credentials: CredentialsSchema,
})

export const SendPasswordResetEmailSchema = z.object({
  email: EmailSchema,
})
export type SendPasswordResetEmail = z.infer<
  typeof SendPasswordResetEmailSchema
>

export const ResetPasswordSchema = z.object({
  token: TokenSchema,
  password: PasswordSchema,
})
export type ResetPassword = z.infer<typeof ResetPasswordSchema>

export const SendConfirmationEmailSchema = z.object({
  email: EmailSchema,
})

export const ConfirmEmailSchema = z.object({
  token: TokenSchema,
})

export const CheckoutSessionSchema = z.object({
  priceId: z.string().min(1),
  email: EmailSchema,
})
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>

export const GetUserAttendanceSchema = z.object({
  email: EmailSchema,
})

export const UpdateAttendanceSchema = z.object({
  email: EmailSchema,
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
  name: NameSchema,
  ticker: z.string().min(1).max(5),
})
export type AddStock = z.infer<typeof AddStockSchema>

export const AddVoteSchema = z.object({
  email: EmailSchema,
  direction: z.enum(['long', 'short', 'hold']),
  price: z.number().min(0),
})
export type AddVote = z.infer<typeof AddVoteSchema>

export const GetPaidSemesterSchema = z.object({
  email: EmailSchema,
})
export type GetPaidSemester = z.infer<typeof GetPaidSemesterSchema>

export const GetIsPaidMemberSchema = z.object({
  email: EmailSchema,
})
export type GetIsPaidMember = z.infer<typeof GetIsPaidMemberSchema>
