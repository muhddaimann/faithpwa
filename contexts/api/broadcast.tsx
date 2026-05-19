import api from "./api";

export interface Broadcast {
  ID: number;
  BroadcastType: string;
  BroadcastPriority: string;
  NewsName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Content: string;
  CreatedBy: string;
  CreatedDateTime: string;
  Acknowledged: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  acknowledged?: number;
}

export const getActiveBroadcasts = async (): Promise<ApiResponse<
  Broadcast[]
> | null> => {
  try {
    const response = await api.get<ApiResponse<Broadcast[]>>("/broadcast.php");

    if (response.data.status === "success") {
      return response.data;
    }

    console.error(
      "Failed to fetch active broadcasts:",
      response.data.message || "Unknown error",
    );
    return null;
  } catch (error) {
    console.error("Error fetching active broadcasts:", error);
    return null;
  }
};

export const getBroadcastById = async (
  broadcast_id: number,
): Promise<ApiResponse<Broadcast> | null> => {
  try {
    const response = await api.get<ApiResponse<Broadcast>>(
      `/broadcast.php?id=${broadcast_id}`,
    );

    if (response.data.status === "success") {
      return response.data;
    }

    console.error(
      "Failed to fetch broadcast:",
      response.data.message || "Unknown error",
    );
    return null;
  } catch (error) {
    console.error("Error fetching broadcast details:", error);
    return null;
  }
};

export const acknowledgeBroadcast = async (
  broadcast_id: number,
): Promise<ApiResponse<null> | null> => {
  try {
    const response = await api.post<ApiResponse<null>>("/broadcast.php", {
      broadcast_id,
    });

    if (response.data.status === "success") {
      return response.data;
    }

    console.error(
      "Failed to acknowledge broadcast:",
      response.data.message || "Unknown error",
    );
    return null;
  } catch (error) {
    console.error("Error acknowledging broadcast:", error);
    return null;
  }
};
