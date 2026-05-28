import api from './api';

export interface Broadcast {
  broadcast_id: number;
  BroadcastType: string;
  BroadcastPriority: string;
  NewsName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Content: string;
  CreatedBy: string;
  CreatedDateTime: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const getActiveBroadcasts = async (): Promise<ApiResponse<Broadcast[]> | null> => {
  try {
    const response = await api.get<ApiResponse<Broadcast[]>>('/broadcast.php');

    if (response.data.status === 'success') {
      return response.data;
    } else {
      console.error('Failed to fetch active broadcasts:', response.data.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('Error fetching active broadcasts:', error);
    return null;
  }
};

export const getBroadcastById = async (
  broadcast_id: string
): Promise<ApiResponse<Broadcast> | null> => {
  try {
    const response = await api.get<ApiResponse<Broadcast>>(`/broadcast.php?id=${broadcast_id}`);

    if (response.data.status === 'success' && response.data.data) {
      return response.data;
    } else {
      console.error('Failed to fetch broadcast:', response.data.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('Error fetching broadcast details:', error);
    return null;
  }
};
