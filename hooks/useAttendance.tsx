import { useEffect, useMemo, useCallback } from 'react';
import { useAttendanceStore } from '../contexts/api/attendanceStore';
import { attendanceStatuses, getStatusFromRecord } from '../constants/attendance';
import { findHoliday, toDateKey } from '../helpers/attendance';
import type { Attendance } from '../contexts/api/attendance';

export const useAttendance = () => {
  const {
    records,
    holidays,
    statusMap,
    loading,
    error,
    fetchAttendance,
    clear,
  } = useAttendanceStore();

  // Initial fetch of attendance records, holidays and status descriptions
  useEffect(() => {
    if (records.length === 0 && !loading && !error) {
      fetchAttendance();
    }
  }, [records.length, loading, error, fetchAttendance]);

  // Statistics for dashboard or insights
  const stats = useMemo(() => {
    const presentCount = records.filter(r => r.login_status !== 'false' && r.status !== 'RD').length;
    const lateCount = records.filter(r => r.login_status === 'late').length;

    const todayKey = toDateKey(new Date());
    const todayRecord = records.find(r => toDateKey(r.schedule_date) === todayKey);

    return {
      totalRecords: records.length,
      presentCount,
      lateCount,
      todayRecord: todayRecord || null,
    };
  }, [records]);

  const noRecords = useMemo(() => error === "No attendance records found", [error]);

  const getHoliday = useCallback(
    (scheduleDate?: string | null) => findHoliday(holidays, scheduleDate),
    [holidays],
  );

  // Status text is sourced from the API; a public holiday name takes precedence.
  const describeStatus = useCallback(
    (record?: Attendance | null): string => {
      if (!record) return "";
      const holiday = findHoliday(holidays, record.schedule_date);
      if (holiday) return holiday.description;
      return statusMap[record.status] || attendanceStatuses[getStatusFromRecord(record)].label;
    },
    [holidays, statusMap],
  );

  return {
    records,
    holidays,
    statusMap,
    loading,
    error: noRecords ? null : error, // Hide the error if it's just 'no records'
    noRecords,
    stats,
    getHoliday,
    describeStatus,
    refreshAttendance: fetchAttendance,
    clearAttendanceData: clear,
  };
};
