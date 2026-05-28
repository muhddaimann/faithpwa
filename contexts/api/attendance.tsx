import api from './api';

export interface Attendance {
  attendance_id: number;
  schedule_date: string;
  status: string;
  shift_id: number;
  original_login: string | null;
  original_logout: string | null;
  actual_login: string | null;
  actual_logout: string | null;
  reason: string | null;
  remarks: string | null;
  login_status: LoginStatus | LoginStatusFallback;
  logout_status: LogoutStatus | LogoutStatusFallback;
  login_difference: string | null;
  logout_difference: string | null;
}

export enum LoginStatus {
  Exact = 'exact',
  Early = 'early',
  Late = 'late',
}

export enum LogoutStatus {
  Exact = 'exact',
  Early = 'early',
  Late = 'late',
}

export enum LoginStatusFallback {
  False = 'false',
}

export enum LogoutStatusFallback {
  Before = 'before',
  False = 'false',
}

export interface AttendanceError {
  error: string;
}

export type AttendanceResponse = Attendance[];

export type AttendanceAPIResponse = AttendanceResponse | AttendanceError;

export interface PublicHoliday {
  holiday_id: number;
  date: string;
  description: string;
  gazetted: string;
  department_profile_id: string;
}

export interface PublicHolidayError {
  error: string;
}

export type PublicHolidayResponse = PublicHoliday[];

export type PublicHolidayAPIResponse = PublicHolidayResponse | PublicHolidayError;

export interface AttendanceStatus {
  Code: string;
  Description: string;
}

export interface AttendanceStatusError {
  error: string;
}

export type AttendanceStatusAPIResponse = AttendanceStatus | AttendanceStatusError;

export const getAttendanceDef = async (): Promise<AttendanceAPIResponse | AttendanceError> => {
  try {
    // const response = await api.get<AttendanceAPIResponse>('/attendance.php?default=true');
    const response = await api.get<AttendanceAPIResponse>('/attendance.php');
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return { error: 'Failed to fetch attendance records.' } as AttendanceError;
  }
};

export const getPublicHolidays = async (): Promise<
  PublicHolidayAPIResponse | PublicHolidayError
> => {
  try {
    const response = await api.get<PublicHolidayAPIResponse>('/pholiday.php');
    return response.data;
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    return { error: 'Failed to fetch public holidays.' } as PublicHolidayError;
  }
};

export const getAttendanceStatusDescription = async (
  statusCode: string,
): Promise<AttendanceStatusAPIResponse | AttendanceStatusError> => {
  try {
    const response = await api.get<AttendanceStatusAPIResponse>(
      `/attStatus.php?statusCode=${statusCode}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance status description:', error);
    return { error: 'Failed to fetch attendance status description.' } as AttendanceStatusError;
  }
};
