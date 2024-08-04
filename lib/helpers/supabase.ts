import { membershipConfig } from '@/config/membership'
import { Semester } from '@/types/common-schemas'
import { Period } from '@/types/database-schemas'
import { createClient } from '@supabase/supabase-js'
import { HttpStatusCode } from 'axios'
import { ApiError } from 'next/dist/server/api-utils'

const options = {
  auth: {
    persistSession: false,
  },
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.SUPABASE_HOST!,
  process.env.SUPABASE_ANON_KEY!,
  options
)

export async function createNewPeriod() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  // Set same arbitrary year as config to compare month and day
  currentDate.setFullYear(membershipConfig.year.start_date.getFullYear())

  let startYear = 0

  // Determine the correct start year based on the current date
  if (currentDate >= membershipConfig.year.start_date) {
    // June to December (Summer months and first half of school year)
    startYear = currentYear
  } else {
    // January to May (second half of school year)
    startYear = currentYear - 1
  }

  const endYear = startYear + 1

  // Set the start and end dates for the period
  const startDate = new Date(membershipConfig.year.start_date)
  startDate.setFullYear(startYear)
  const endDate = new Date(membershipConfig.year.end_date)
  endDate.setFullYear(endYear)

  // Create a new period object
  const newPeriod: Period = {
    name: `${startYear}-${endYear}`,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  }

  // Insert the new period into the database
  const { data: period, error: insertPeriodError } = await supabase
    .from('period')
    .insert(newPeriod)
    .select()
    .single()

  if (insertPeriodError) throw insertPeriodError

  return period
}

export async function getPaidSemesters(email: string) {
  const currentDate = new Date().toISOString().split('T')[0]

  const member = await getMemberByEmail(email)
  if (!member) {
    throw new ApiError(
      HttpStatusCode.NotFound,
      `No account associated with the email: ${email}`
    )
  }

  let period = await getCurrentPeriod(currentDate)
  if (!period) {
    period = await createNewPeriod()
    throw new ApiError(
      HttpStatusCode.NotFound,
      `No membership periods found: ${period.name}`
    )
  }

  const paymentRecords = await getPaymentRecords(member.id, period.id)
  const paidMemberships = await getPaidMemberships(paymentRecords)

  const paidSemesters = paidMemberships.map((membership) => membership.type)
  return paidSemesters
}

export async function isPaidMember(email: string) {
  const paidSemesters = await getPaidSemesters(email)
  const currentSemester = getCurrentSemester()

  return (
    paidSemesters.includes(currentSemester) || paidSemesters.includes('year')
  )
}

function getCurrentSemester(): Semester {
  const currentMonthDay = new Date()
  currentMonthDay.setFullYear(membershipConfig.year.start_date.getFullYear())
  const fallSemester = membershipConfig.fall

  if (
    currentMonthDay >= fallSemester.start_date &&
    currentMonthDay <= fallSemester.end_date
  ) {
    return 'fall'
  } else {
    return 'spring'
  }
}

async function getMemberByEmail(email: string) {
  const { data: member, error } = await supabase
    .from('member')
    .select()
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  if (!member) {
    return null
  }

  return member
}

export async function getMemberById(id: string) {
  const { data: member, error } = await supabase
    .from('member')
    .select('first_name, last_name, full_name, email, bio')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!member) {
    return null
  }

  return member
}

export async function getCurrentPeriod(currentDate: string) {
  const { data: period, error } = await supabase
    .from('period')
    .select()
    .lte('start_date', currentDate)
    .gte('end_date', currentDate)
    .maybeSingle()
  if (error) throw error
  return period
}

export async function getPaymentRecords(memberId: string, periodId: string) {
  const { data: paymentRecords, error } = await supabase
    .from('payment_record')
    .select('membership_id, period_id')
    .eq('member_id', memberId)
    .eq('period_id', periodId)
  if (error) throw error
  if (!paymentRecords.length) {
    return []
  }
  return paymentRecords
}

export async function getPaidMemberships(paymentRecords: any[]) {
  const membershipIds = paymentRecords.map((record) => record.membership_id)
  const { data: memberships, error } = await supabase
    .from('membership')
    .select()
    .in('id', membershipIds)
  if (error) throw error
  if (memberships.length === 0) {
    return []
  }

  return memberships
}

export async function getStockHistorical(stockId: string) {
  const { data: stockHistorical, error } = await supabase
    .from('stock_historical')
    .select()
    .eq('stock_id', stockId)
  if (error) throw error
  if (stockHistorical.length === 0) {
    return []
  }

  return stockHistorical
}

export async function getActiveMeeting(stockId: string) {
  const { data: meeting, error } = await supabase
    .from('meeting')
    .select('id, meeting_date, agenda, guest_speaker_member_id')
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  if (!meeting) {
    return null
  }

  return meeting
}
