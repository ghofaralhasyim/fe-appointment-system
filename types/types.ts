export interface User {
    user_id: number;
    name: string;
    username: string;
    timezone: string;
    role: string;
    created_at: string;
}

export interface AuthToken {
    access_token: string;
    refresh_token: string;
}

export interface Reservation {
    id: number;
    title: string;
    appointment_date: string;
    duration: string;
    participants: string[];
}

export interface Appointment {
    appointment_id: number;
    host_id: number;
    title: string;
    start_time: string;
    end_time: string;
    created_at: string;
    total_attendants: number;
    invitation_id: number;
    status: string,
    notes: string;
    host: User;
    attendants: User[];
}