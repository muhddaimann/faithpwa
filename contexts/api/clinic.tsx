import api from './api';

export interface Clinic {
  clinic_id: number;
  clinic_name: string;
  address: string;
  state: string;
  area: string;
  contact: string;
  email: string;
}

export interface ClinicResponse extends Clinic {
  error?: string;
}

export const searchClinics = async (query: string): Promise<Clinic[]> => {
  try {
    const response = await api.get<ClinicResponse[]>('/clinic.php', {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching clinics:', error);
    throw error;
  }
};
