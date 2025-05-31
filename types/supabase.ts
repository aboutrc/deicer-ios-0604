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
      markers: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string
          category: 'ice' | 'observer'
          latitude: number
          longitude: number
          created_at: string
          updated_at: string
          active: boolean
          last_confirmed: string
          confirmations_count: number
          last_status_change: string
          reliability_score: number
          negative_confirmations: number
          image_url: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description: string
          category: 'ice' | 'observer'
          latitude: number
          longitude: number
          created_at?: string
          updated_at?: string
          active?: boolean
          last_confirmed?: string
          confirmations_count?: number
          last_status_change?: string
          reliability_score?: number
          negative_confirmations?: number
          image_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string
          category?: 'ice' | 'observer'
          latitude?: number
          longitude?: number
          created_at?: string
          updated_at?: string
          active?: boolean
          last_confirmed?: string
          confirmations_count?: number
          last_status_change?: string
          reliability_score?: number
          negative_confirmations?: number
          image_url?: string | null
        }
      }
      marker_confirmations: {
        Row: {
          id: string
          marker_id: string
          user_id: string | null
          confirmed_at: string
          is_active: boolean
          confirmed_from: string
          cooldown_expires: string
        }
        Insert: {
          id?: string
          marker_id: string
          user_id?: string | null
          confirmed_at?: string
          is_active: boolean
          confirmed_from: string
          cooldown_expires?: string
        }
        Update: {
          id?: string
          marker_id?: string
          user_id?: string | null
          confirmed_at?: string
          is_active?: boolean
          confirmed_from?: string
          cooldown_expires?: string
        }
      }
    }
  }
}