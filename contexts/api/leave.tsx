import api from "./api";

export type Leave = {
  leave_id: number;
  leave_type: string;
  leave_name: string;
  leave_period: string;
  start_date: string;
  start: string;
  end_date: string;
  end: string;
  date: string;
  duration: string;
  duration_name: string;
  reason?: string;
  clinic_id?: number;
  illness?: string;
  remarks?: string;
  document_ref_no?: string;
  document_url?: string;
  manager_status: string;
  tl_status?: string;
  cancellation_dt?: string;
  cancellation_by?: string;
  cancellation_action?: string;
};

export type LeaveResponse = {
  message?: string;
  leaveRecords?: Leave[];
  leave_id?: number;
  error?: string;
};

export const getLeave = async (): Promise<Leave[]> => {
  try {
    const response = await api.get<Leave[]>("/leave.php");

    if (!Array.isArray(response.data)) {
      throw new Error("No leave records found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching leave records:", error);
    throw error;
  }
};

export const addLeave = async (formData: FormData): Promise<LeaveResponse> => {
  try {
    const response = await api.post<LeaveResponse>("/leave.php", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error("Error adding leave record:", error);
    throw error;
  }
};

export const withdrawLeave = async (
  leave_id: number,
): Promise<LeaveResponse> => {
  try {
    const response = await api.post<LeaveResponse>(
      "/leave.php?action=withdraw",
      { leave_id },
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error("Error withdrawing leave application:", error);
    throw error;
  }
};
