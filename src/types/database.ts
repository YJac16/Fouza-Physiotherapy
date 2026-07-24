/**
 * Generated Supabase Database types.
 * Replace via: npm run db:types
 *
 * Until migrations are applied and types are generated, this stub
 * provides the shape used by typed Supabase clients.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase?: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "admin" | "practitioner" | "receptionist" | "patient";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "practitioner" | "receptionist" | "patient";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "practitioner" | "receptionist" | "patient";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          profile_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          medical_aid_name: string | null;
          medical_aid_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          medical_aid_name?: string | null;
          medical_aid_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          medical_aid_name?: string | null;
          medical_aid_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      practitioners: {
        Row: {
          id: string;
          profile_id: string;
          title: string | null;
          bio: string | null;
          specialties: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title?: string | null;
          bio?: string | null;
          specialties?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string | null;
          bio?: string | null;
          specialties?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practitioners_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          duration_minutes: number;
          price_cents: number;
          currency: string;
          is_bookable_online: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          duration_minutes: number;
          price_cents: number;
          currency?: string;
          is_bookable_online?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          duration_minutes?: number;
          price_cents?: number;
          currency?: string;
          is_bookable_online?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          practitioner_id: string;
          service_id: string | null;
          starts_at: string;
          ends_at: string;
          status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          source: "online" | "admin" | "phone";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          practitioner_id: string;
          service_id?: string | null;
          starts_at: string;
          ends_at: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          source?: "online" | "admin" | "phone";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          practitioner_id?: string;
          service_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          source?: "online" | "admin" | "phone";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_practitioner_id_fkey";
            columns: ["practitioner_id"];
            isOneToOne: false;
            referencedRelation: "practitioners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_notes: {
        Row: {
          id: string;
          patient_id: string;
          practitioner_id: string;
          appointment_id: string | null;
          subjective: string | null;
          objective: string | null;
          assessment: string | null;
          plan: string | null;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          practitioner_id: string;
          appointment_id?: string | null;
          subjective?: string | null;
          objective?: string | null;
          assessment?: string | null;
          plan?: string | null;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          practitioner_id?: string;
          appointment_id?: string | null;
          subjective?: string | null;
          objective?: string | null;
          assessment?: string | null;
          plan?: string | null;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_programmes: {
        Row: {
          id: string;
          patient_id: string;
          practitioner_id: string;
          title: string;
          description: string | null;
          status: "draft" | "active" | "completed" | "archived";
          starts_on: string | null;
          ends_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          practitioner_id: string;
          title: string;
          description?: string | null;
          status?: "draft" | "active" | "completed" | "archived";
          starts_on?: string | null;
          ends_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          practitioner_id?: string;
          title?: string;
          description?: string | null;
          status?: "draft" | "active" | "completed" | "archived";
          starts_on?: string | null;
          ends_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programme_exercises: {
        Row: {
          id: string;
          programme_id: string;
          name: string;
          instructions: string | null;
          sets: number | null;
          reps: number | null;
          hold_seconds: number | null;
          media_url: string | null;
          sort_order: number;
          exercise_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          programme_id: string;
          name: string;
          instructions?: string | null;
          sets?: number | null;
          reps?: number | null;
          hold_seconds?: number | null;
          media_url?: string | null;
          sort_order?: number;
          exercise_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          programme_id?: string;
          name?: string;
          instructions?: string | null;
          sets?: number | null;
          reps?: number | null;
          hold_seconds?: number | null;
          media_url?: string | null;
          sort_order?: number;
          exercise_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programme_exercises_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "exercise_programmes";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          instructions: string | null;
          media_url: string | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          instructions?: string | null;
          media_url?: string | null;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          instructions?: string | null;
          media_url?: string | null;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      consent_forms: {
        Row: {
          id: string;
          title: string;
          slug: string;
          body_md: string;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          body_md: string;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          body_md?: string;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      consent_signatures: {
        Row: {
          id: string;
          form_id: string;
          patient_id: string;
          signed_at: string;
          signature_data: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          patient_id: string;
          signed_at?: string;
          signature_data?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          patient_id?: string;
          signed_at?: string;
          signature_data?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      intake_forms: {
        Row: {
          id: string;
          title: string;
          slug: string;
          schema_json: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          schema_json?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          schema_json?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      intake_responses: {
        Row: {
          id: string;
          form_id: string;
          patient_id: string;
          appointment_id: string | null;
          answers: Json;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          patient_id: string;
          appointment_id?: string | null;
          answers?: Json;
          submitted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          patient_id?: string;
          appointment_id?: string | null;
          answers?: Json;
          submitted_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          patient_id: string;
          appointment_id: string | null;
          invoice_number: string;
          status: "draft" | "sent" | "paid" | "void" | "overdue";
          issue_date: string;
          due_date: string | null;
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          appointment_id?: string | null;
          invoice_number: string;
          status?: "draft" | "sent" | "paid" | "void" | "overdue";
          issue_date: string;
          due_date?: string | null;
          subtotal_cents: number;
          tax_cents?: number;
          total_cents: number;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          appointment_id?: string | null;
          invoice_number?: string;
          status?: "draft" | "sent" | "paid" | "void" | "overdue";
          issue_date?: string;
          due_date?: string | null;
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price_cents: number;
          amount_cents: number;
          treatment_code: string | null;
          icd10_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price_cents: number;
          amount_cents: number;
          treatment_code?: string | null;
          icd10_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price_cents?: number;
          amount_cents?: number;
          treatment_code?: string | null;
          icd10_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          patient_id: string;
          invoice_id: string | null;
          amount_cents: number;
          currency: string;
          method: "cash" | "card" | "eft" | "other";
          paid_at: string;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          invoice_id?: string | null;
          amount_cents: number;
          currency?: string;
          method?: "cash" | "card" | "eft" | "other";
          paid_at?: string;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          invoice_id?: string | null;
          amount_cents?: number;
          currency?: string;
          method?: "cash" | "card" | "eft" | "other";
          paid_at?: string;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          patient_id: string;
          uploaded_by: string | null;
          title: string;
          doc_type: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          is_patient_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          uploaded_by?: string | null;
          title: string;
          doc_type?: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          is_patient_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          uploaded_by?: string | null;
          title?: string;
          doc_type?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          is_patient_visible?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          practitioner_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          slot_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          practitioner_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          slot_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          practitioner_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          slot_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_rules_practitioner_id_fkey";
            columns: ["practitioner_id"];
            isOneToOne: false;
            referencedRelation: "practitioners";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_exceptions: {
        Row: {
          id: string;
          practitioner_id: string;
          exception_date: string;
          is_available: boolean;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practitioner_id: string;
          exception_date: string;
          is_available?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practitioner_id?: string;
          exception_date?: string;
          is_available?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      appointment_holds: {
        Row: {
          id: string;
          practitioner_id: string;
          service_id: string | null;
          starts_at: string;
          ends_at: string;
          hold_token: string;
          email: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          practitioner_id: string;
          service_id?: string | null;
          starts_at: string;
          ends_at: string;
          hold_token: string;
          email?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          practitioner_id?: string;
          service_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          hold_token?: string;
          email?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      staff_invites: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "admin" | "practitioner" | "receptionist";
          token: string;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: "admin" | "practitioner" | "receptionist";
          token: string;
          invited_by: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "admin" | "practitioner" | "receptionist";
          token?: string;
          invited_by?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          excerpt: string | null;
          body_md: string;
          cover_image_url: string | null;
          status: "draft" | "published" | "archived";
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          slug: string;
          excerpt?: string | null;
          body_md: string;
          cover_image_url?: string | null;
          status?: "draft" | "published" | "archived";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          body_md?: string;
          cover_image_url?: string | null;
          status?: "draft" | "published" | "archived";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      google_reviews: {
        Row: {
          id: string;
          google_review_id: string | null;
          author_name: string;
          rating: number;
          text: string | null;
          reviewed_at: string | null;
          is_featured: boolean;
          is_visible: boolean;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          google_review_id?: string | null;
          author_name: string;
          rating: number;
          text?: string | null;
          reviewed_at?: string | null;
          is_featured?: boolean;
          is_visible?: boolean;
          synced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          google_review_id?: string | null;
          author_name?: string;
          rating?: number;
          text?: string | null;
          reviewed_at?: string | null;
          is_featured?: boolean;
          is_visible?: boolean;
          synced_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      review_requests: {
        Row: {
          id: string;
          patient_id: string;
          appointment_id: string | null;
          sent_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          appointment_id?: string | null;
          sent_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          appointment_id?: string | null;
          sent_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      practice_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_outbox: {
        Row: {
          id: string;
          channel: "email" | "sms" | "whatsapp" | "in_app";
          template_key: string;
          recipient: string;
          payload: Json;
          status: "pending" | "sent" | "failed" | "cancelled";
          attempts: number;
          last_error: string | null;
          scheduled_for: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel?: "email" | "sms" | "whatsapp" | "in_app";
          template_key: string;
          recipient: string;
          payload?: Json;
          status?: "pending" | "sent" | "failed" | "cancelled";
          attempts?: number;
          last_error?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          channel?: "email" | "sms" | "whatsapp" | "in_app";
          template_key?: string;
          recipient?: string;
          payload?: Json;
          status?: "pending" | "sent" | "failed" | "cancelled";
          attempts?: number;
          last_error?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          meta?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          meta?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      patient_timeline_events: {
        Row: {
          id: string;
          patient_id: string;
          event_type: string;
          title: string;
          summary: string | null;
          entity_type: string | null;
          entity_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          event_type: string;
          title: string;
          summary?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          event_type?: string;
          title?: string;
          summary?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      next_invoice_number: {
        Args: Record<string, never> | never;
        Returns: string;
      };
    };
    Enums: {
      app_role: "admin" | "practitioner" | "receptionist" | "patient";
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
      appointment_source: "online" | "admin" | "phone";
      programme_status: "draft" | "active" | "completed" | "archived";
      invoice_status: "draft" | "sent" | "paid" | "void" | "overdue";
      blog_status: "draft" | "published" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
