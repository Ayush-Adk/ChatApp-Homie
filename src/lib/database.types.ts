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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          status: string
          last_seen: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          status?: string
          last_seen?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          status?: string
          last_seen?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          chat_id: string
          content: string
          type: string
          created_at: string
          read_by: string[]
        }
        Insert: {
          id?: string
          sender_id: string
          chat_id: string
          content: string
          type?: string
          created_at?: string
          read_by?: string[]
        }
        Update: {
          id?: string
          sender_id?: string
          chat_id?: string
          content?: string
          type?: string
          created_at?: string
          read_by?: string[]
        }
      }
      chats: {
        Row: {
          id: string
          type: string
          name: string | null
          created_at: string
          last_message: string | null
          last_message_at: string | null
        }
        Insert: {
          id?: string
          type: string
          name?: string | null
          created_at?: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          name?: string | null
          created_at?: string
          last_message?: string | null
          last_message_at?: string | null
        }
      }
      chat_participants: {
        Row: {
          chat_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          chat_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          chat_id?: string
          user_id?: string
          joined_at?: string
        }
      }
    }
  }
}