import { useEffect, useMemo } from 'react';
import { useAttendanceStore } from '../contexts/api/attendanceStore';

export const useAttendance = () => {
  const {
    records,
    loading,
    error,
    fetchAttendance,
    clear,
  } = useAttendanceStore();

  // Initial fetch of attendance records
  useEffect(() => {
    if (records.length === 0 && !loading && !error) {
      fetchAttendance();
    }
  }, [records.length, loading, error, fetchAttendance]);

  // Statistics for dashboard or insights
  const stats = useMemo(() => {
    const presentCount = records.filter(r => r.login_status !== 'false' && r.status !== 'RD').length;
    const lateCount = records.filter(r => r.login_status === 'late').length;
    
    // Find today's record
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(r => r.schedule_date === todayStr);

    return {
      totalRecords: records.length,
      presentCount,
      lateCount,
      todayRecord: todayRecord || null,
    };
  }, [records]);

  const noRecords = useMemo(() => error === "No attendance records found", [error]);

  return {
    records,
    loading,
    error: noRecords ? null : error, // Hide the error if it's just 'no records'
    noRecords,
    stats,
    refreshAttendance: fetchAttendance,
    clearAttendanceData: clear,
  };
};
