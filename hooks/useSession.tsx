import { useEffect, useMemo, useState } from 'react';
import { getSessionInfo, type SessionInfo } from '../contexts/api/auth';
import { formatLongDate, formatTime } from '../helpers/date';

export const useSession = () => {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSessionInfo()
      .then((data) => {
        if (active) setInfo(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const lastLogin = useMemo(() => {
    if (!info?.login_at) return null;
    return `${formatLongDate(info.login_at)}, ${formatTime(info.login_at)}`;
  }, [info]);

  return {
    info,
    loading,
    lastLogin,
    clientIp: info?.login_ip ?? null,
    platform: info?.platform ?? null,
  };
};
