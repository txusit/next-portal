export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attendance_record: {
        Row: {
          id: string
          meeting_id: string
          member_id: string
        }
        Insert: {
          id?: string
          meeting_id: string
          member_id: string
        }
        Update: {
          id?: string
          meeting_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attendance_record_meeting_id_fkey'
            columns: ['meeting_id']
            referencedRelation: 'meeting'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendance_record_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'member'
            referencedColumns: ['id']
          }
        ]
      }
      meeting: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          meeting_date: string
          stock_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          meeting_date: string
          stock_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          meeting_date?: string
          stock_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'meeting_stock_id_fkey'
            columns: ['stock_id']
            referencedRelation: 'stock'
            referencedColumns: ['id']
          }
        ]
      }
      member: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          full_name: string | null
          id: string
          is_confirmed: boolean
          last_name: string
          membership_id: string | null
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          full_name?: string | null
          id?: string
          is_confirmed?: boolean
          last_name: string
          membership_id?: string | null
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          full_name?: string | null
          id?: string
          is_confirmed?: boolean
          last_name?: string
          membership_id?: string | null
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: 'member_membership_id_fkey'
            columns: ['membership_id']
            referencedRelation: 'membership'
            referencedColumns: ['id']
          }
        ]
      }
      membership: {
        Row: {
          id: string
          price: number
          type: string
        }
        Insert: {
          id?: string
          price?: number
          type: string
        }
        Update: {
          id?: string
          price?: number
          type?: string
        }
        Relationships: []
      }
      pitch: {
        Row: {
          created_at: string | null
          direction: string
          id: string
          stock_id: string
          votes_against: number
          votes_for: number
        }
        Insert: {
          created_at?: string | null
          direction: string
          id?: string
          stock_id: string
          votes_against?: number
          votes_for?: number
        }
        Update: {
          created_at?: string | null
          direction?: string
          id?: string
          stock_id?: string
          votes_against?: number
          votes_for?: number
        }
        Relationships: [
          {
            foreignKeyName: 'pitch_stock_id_fkey'
            columns: ['stock_id']
            referencedRelation: 'stock'
            referencedColumns: ['id']
          }
        ]
      }
      stock: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number
          ticker: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price?: number
          ticker: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          ticker?: string
        }
        Relationships: []
      }
      vote: {
        Row: {
          created_at: string | null
          id: number
          meeting_id: string
          member_id: string
          pitch_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          meeting_id: string
          member_id: string
          pitch_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          meeting_id?: string
          member_id?: string
          pitch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vote_meeting_id_fkey'
            columns: ['meeting_id']
            referencedRelation: 'meeting'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vote_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'member'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vote_pitch_id_fkey'
            columns: ['pitch_id']
            referencedRelation: 'pitch'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
