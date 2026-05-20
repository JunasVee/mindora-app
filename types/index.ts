export type Emotion = 'Senang' | 'Biasa aja' | 'Cemas' | 'Sedih' | 'Frustrasi' | 'Overwhelmed';
export type Zone = 'green' | 'yellow' | 'red';
export type ProfessionalTier = 'Junior' | 'Middle' | 'Senior';
export type ProfessionalType = 'Psikolog' | 'Psikiater';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid';

export interface User {
  id: string;
  email: string;
  name: string;
  is_premium: boolean;
  created_at: string;
  streak: number;
  session_count: number;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  sleep_quality: number;
  emotion: Emotion;
  has_concern: boolean;
  concern_text?: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  intensity_score?: number;
  zone?: Zone;
  created_at: string;
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  type: ProfessionalType;
  tier: ProfessionalTier;
  specialization: string;
  price: number;
  rating: number;
  review_count: number;
  available: boolean;
  avatar_color: string;
  bio?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  professional_id: string;
  professional?: Professional;
  date: string;
  time_slot: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface ForecastDay {
  day: string;
  date: string;
  emotion: Emotion;
  probability: number;
  severity: number;
}

export interface WeekForecast {
  week_offset: number;
  days: ForecastDay[];
  avg_severity: number;
  prevention_plan: PreventionPlan;
}

export interface PreventionPlan {
  title: string;
  description: string;
  actions: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'checkin_reminder' | 'forecast_alert' | 'booking_confirmed' | 'session_reminder';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}
