import api from "./api";

/* =======================
   TYPES
======================= */

export type LeaveTypeCode = "AL";

export interface LeaveBalanceResponse {
  leaveType: "AL";
  month: string; // YYYY-MM
  balance: number;
}

export interface ErrorResponse {
  error: string;
}

/* =======================
   API CALL
======================= */

export const getLeaveBalance = async (
  month: string,
): Promise<LeaveBalanceResponse | ErrorResponse> => {
  try {
    const response = await api.get<LeaveBalanceResponse | ErrorResponse>(
      "/balance.php",
      {
        params: { month },
      },
    );

    if ("error" in response.data) {
      return { error: response.data.error };
    }

    return response.data;
  } catch {
    return { error: "Error fetching leave balance." };
  }
};
