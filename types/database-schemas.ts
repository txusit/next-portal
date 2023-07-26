// import { Database } from './supabase-generated'

// export type AttendanceRecord =
//   Database['public']['Tables']['attendance_record']['Row']
// export type Member = Database['public']['Tables']['member']['Row']
// export type Meeting = Database['public']['Tables']['meeting']['Row']
// export type Membership = Database['public']['Tables']['membership']['Row']
// export type Pitch = Database['public']['Tables']['pitch']['Row']
// export type Stock = Database['public']['Tables']['stock']['Row']
// export type Vote = Database['public']['Tables']['vote']['Row']

import { z } from 'zod'

export const AttendanceRecordSchema = z.object({
  id: z.string().optional(),
  meeting_id: z.string(),
  member_id: z.string(),
})

export const MemberSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().nonempty(),
  last_name: z.string().nonempty(),
  full_name: z.string().optional(),
  email: z.string().nonempty(),
  password: z.string().min(6, { message: 'Must be 6 or more characters long' }),
  is_confirmed: z.boolean(),
  membership_id: z.string().nullable(),
  created_at: z.string().optional(),
})

export const MeetingSchema = z.object({
  id: z.string().optional(),
  is_active: z.boolean(),
  meeting_date: z.string(),
  created_at: z.string().optional(),
})

export const MembershipSchema = z.object({
  id: z.string().optional(),
  price: z.number(),
  type: z.string(),
})

export const PitchSchema = z.object({
  id: z.string().optional(),
  stock_id: z.string(),
  meeting_id: z.string(),
  direction: z.enum(['long', 'short', 'hold']),
  created_at: z.string().optional(),
})

export const StockSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  ticker: z.string(),
  price: z.number(),
  created_at: z.string().optional(),
})

export const VoteSchema = z.object({
  id: z.string().optional(),
  meeting_id: z.string(),
  member_id: z.string(),
  pitch_id: z.string(),
  direction: z.enum(['long', 'short', 'hold']),
  price: z.number(),
  created_at: z.string().optional(),
})

export const PaymentRecordSchema = z.object({
  id: z.string().optional(),
  membership_id: z.string(),
  member_id: z.string(),
  created_at: z.string().optional(),
})

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>
export type Member = z.infer<typeof MemberSchema>
export type Meeting = z.infer<typeof MeetingSchema>
export type Membership = z.infer<typeof MembershipSchema>
export type Pitch = z.infer<typeof PitchSchema>
export type Stock = z.infer<typeof StockSchema>
export type Vote = z.infer<typeof VoteSchema>
export type PaymentRecord = z.infer<typeof PaymentRecordSchema>
