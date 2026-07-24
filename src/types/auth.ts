/**
 * Application roles — mirrored in Postgres enum `app_role`.
 */
export type AppRole = "admin" | "practitioner" | "receptionist" | "patient";

export type AuthSessionUser = {
  id: string;
  email: string | undefined;
  role: AppRole;
  fullName: string | null;
  avatarUrl: string | null;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};
