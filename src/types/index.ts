export type Role = "superadmin" | "admin" | "doctor" | "receptionist" | "patient";

export type AppointmentType =
  | "consulta"
  | "cirugia"
  | "procedimiento"
  | "seguimiento"
  | "urgencia"
  | "telemedicina"
  | "estudio";

/**
 * Returns a locale-aware label for an appointment type.
 * Falls back to the raw key if translations are not loaded yet.
 */
export function getAppointmentTypeLabel(
  type: AppointmentType,
  t: (key: string) => string,
): string {
  const key = `appointmentType.${type}`;
  const result = t(key);
  return result !== key ? result : type;
}

/** Static map kept for backwards-compatibility with non-i18n call sites. */
export const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  consulta: "Consultation",
  cirugia: "Surgery",
  procedimiento: "Procedure",
  seguimiento: "Follow-up",
  urgencia: "Emergency",
  telemedicina: "Telemedicine",
  estudio: "Study",
};

export const APPOINTMENT_TYPE_ICON: Record<AppointmentType, string> = {
  consulta: "🩺",
  cirugia: "🔪",
  procedimiento: "💉",
  seguimiento: "📋",
  urgencia: "🚨",
  telemedicina: "📹",
  estudio: "🔬",
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: Role;
  is_active: boolean;
  totp_enabled?: boolean;
  email_verified?: boolean;
  tenant_id?: number | null;
  created_at: string;
}

export interface Specialty {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface Doctor {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  license_number: string;
  bio?: string | null;
  consultation_fee: number;
  specialty: Specialty;
  accepts_telemedicine?: boolean;
  average_rating?: number | null;
  appointment_types?: AppointmentType[];
}

export interface Schedule {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
}

export interface Absence {
  id: number;
  date: string;
  reason?: string | null;
}

export interface Patient {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  dni?: string | null;
  birth_date?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  health_insurance?: string | null;
  insurance_number?: string | null;
  notes?: string | null;
}

export type AppointmentStatus =
  | "pending" | "confirmed" | "checked_in" | "cancelled" | "completed" | "no_show";

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  appointment_type: AppointmentType;
  reason?: string | null;
  notes?: string | null;
  doctor_name?: string | null;
  patient_name?: string | null;
  is_telemedicine?: boolean;
  telemedicine_url?: string | null;
  series_id?: string | null;
}

export interface AppointmentSlot {
  starts_at: string;
  ends_at: string;
  available: boolean;
}

export interface DashboardMetrics {
  total_patients: number;
  total_doctors: number;
  appointments_today: number;
  appointments_pending: number;
  appointments_completed_today?: number;
  revenue_month: number;
  revenue_today?: number;
  occupancy_rate?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  plan: "starter" | "pro" | "enterprise";
  is_active: boolean;
  support_email?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  created_at: string;
  stats?: {
    total_doctors: number;
    total_patients: number;
    appointments_this_month: number;
  };
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id?: number;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  notes?: string | null;
  prescriptions: { drug: string; dosage?: string; frequency?: string }[];
  attachments?: { id: number; filename: string; size: number }[];
  created_at: string;
}
