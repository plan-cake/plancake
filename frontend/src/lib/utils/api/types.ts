export type MessageResponse = {
  message: string[];
}

export type RegisterData = {
  email: string;
  password: string;
}

export type Email = {
  email: string;
}

export type VerificationCode = {
  verification_code: string;
}

export type AccountData = {
  email: string;
  default_display_name: string;
}

export type LoginData = {
  email: string;
  password: string;
  remember_me?: boolean;
}

export type PasswordResetData = {
  reset_token: string;
  new_password: string;
}

export type EventCode = {
  event_code: string;
}

export type NewEventData = {
  title: string;
  duration?: number;
  timeslots: string[];
  time_zone: string;
  custom_code?: string;
}

export type CustomCode = {
  custom_code: string;
}

export type EventEditData = {
  title: string;
  duration?: number;
  timeslots: string[];
  time_zone: string;
  event_code: string;
}

export type EventDetails = {
  title: string;
  duration: number | null;
  timeslots: string[];
  time_zone: string;
  is_creator: boolean;
  event_type: "Date" | "Week";
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

export type AvailabilityAddData = {
  event_code: string;
  display_name: string;
  availability: string[];
  time_zone: string;
}

export type EventDisplayNameData = {
  event_code: string;
  display_name: string;
}

export type SelfAvailability = {
  display_name: string;
  available_dates: string[];
  time_zone: string;
}

export type AllAvailability = {
  user_display_name: string | null;
  participants: string[];
  availability: {
    [timeslot: string]: string[];
  }
}

export type DashboardEvent = {
  title: string;
  event_type: "Date" | "Week";
  duration: number | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  participants: string[];
  event_code: string;
}

export type DashboardData = {
  created_events: DashboardEvent[];
  participated_events: DashboardEvent[];
}

export type DisplayName = {
  display_name: string;
}
