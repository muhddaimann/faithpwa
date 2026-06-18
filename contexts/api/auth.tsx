import api from './api';
import { removeToken, storeToken, storeSessionId } from '../tokenContext';

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthResponse = {
  status: 'success' | 'invalid_credentials' | 'account_inactive' | 'locked' | string;
  token?: string;
  message?: string;
  staff_id?: number;
  session_id?: string;
  expires_at?: number;
  SiteDepartmentProfileID?: string;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth.php', credentials);
    const { token, session_id, expires_at } = response.data;

    if (typeof token === 'string') {
      // Prefer the server's expiry so the client clock matches the session row.
      const expiration = expires_at ?? Math.floor(Date.now() / 1000) + 604800;
      await storeToken(token, expiration);
      if (session_id) await storeSessionId(session_id);
    }

    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Unexpected error';
    return { status: 'error', message };
  }
};

export type SessionInfo = {
  status?: string;
  login_at?: string;
  login_ip?: string;
  last_seen_at?: string;
  last_seen_ip?: string;
  platform?: string;
  device_name?: string;
  expires_at?: string;
};

// Current session detail for the Home footer. Returns null if unavailable
// (endpoint not deployed yet, offline, etc.) so the UI degrades gracefully.
export const getSessionInfo = async (): Promise<SessionInfo | null> => {
  try {
    const res = await api.get<SessionInfo>('/session.php');
    return res.data?.status === 'success' ? res.data : null;
  } catch {
    return null;
  }
};

// Revoke the current session server-side. Best-effort: the token (and thus the
// jti) is sent via the request interceptor; must run BEFORE the token is cleared.
export const revokeSession = async (): Promise<void> => {
  try {
    await api.post('/logout.php');
  } catch {
    // Offline / already-expired session — local sign-out proceeds regardless.
  }
};

export const logout = async (): Promise<void> => {
  try {
    await removeToken();
  } catch {}
};
