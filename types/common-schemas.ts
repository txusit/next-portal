import { z } from 'zod'

export const DirectionSchema = z.enum(['long', 'short', 'hold', 'abstain'])
export type Direction = z.infer<typeof DirectionSchema>

export const SemesterSchema = z.enum(['fall', 'spring', 'year'])
export type Semester = z.infer<typeof SemesterSchema>

export const GradYearSchema = z.number().int().gte(2000).lte(2100)
export const NameSchema = z.string().min(1)
export const EmailSchema = z.string().email()
export const TokenSchema = z.string().min(1)

export const MeetingAgendaSchema = z.object({
  title: z.string(),
  description: z.string(),
})
export type MeetingAgenda = z.infer<typeof MeetingAgendaSchema>

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

export const PortfolioPositionSchema = z.object({
  updatedAt: z.string().date(),
  stockName: z.string(),
  stockTicker: z.string(),
  direction: DirectionSchema,
  buyPrice: z.number().multipleOf(0.01),
  currentPrice: z.number().multipleOf(0.01),
  return: z.number().multipleOf(0.01),
  percentChange: z.number(),
  notes: z.string(),
})
export type PortfolioPosition = z.infer<typeof PortfolioPositionSchema>
