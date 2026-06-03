import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text, useTheme, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLeaveStore } from '../contexts/api/leaveStore';
import { useOverlay } from '../contexts/overlayContext';
import { LeaveStatus, leaveStatusStyles, LEAVE_TYPES, LEAVE_PERIODS, LEAVE_REASONS } from '../constants/leave';
import { type Leave } from '../contexts/api/leave';
import PickerModal from '../components/pickerModal';
import ClinicModal from '../components/clinicModal';
import { Clinic } from '../contexts/api/clinic';
import { useRouter } from 'expo-router';

export const useLeave = (statusFilter: LeaveStatus = 'All') => {
  const theme = useTheme();
  const router = useRouter();
  const { showSheet, hideSheet, toast, confirm, showModal, hideModal, showLoader, hideLoader } = useOverlay();
  const { 
    leaves, 
    balances,
    loading, 
    error, 
    fetchLeaves, 
    fetchBalances,
    addNewLeave, 
    withdraw, 
    clear 
  } = useLeaveStore();
  
  // Form States
  const [leaveType, setLeaveType] = useState<(typeof LEAVE_TYPES)[0] | null>(null);
  const [leavePeriod, setLeavePeriod] = useState<(typeof LEAVE_PERIODS)[0] | null>(null);
  const [selectedReason, setSelectedReason] = useState<(typeof LEAVE_REASONS)[0] | null>(null);
  const [remarks, setRemarks] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Form Helpers
  const selectLeaveType = () => {
    showModal({
      content: (
        <PickerModal
          title="Select Leave Type"
          data={LEAVE_TYPES}
          selected={leaveType}
          onSelect={(item) => {
            setLeaveType(item);
            hideModal();
          }}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.label}
          iconExtractor={(item) => item.icon as any}
        />
      ),
    });
  };

  const selectLeavePeriod = () => {
    showModal({
      content: (
        <PickerModal
          title="Select Period"
          data={LEAVE_PERIODS}
          selected={leavePeriod}
          onSelect={(item) => {
            setLeavePeriod(item);
            hideModal();
          }}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.label}
          iconExtractor={(item) => item.icon as any}
        />
      ),
    });
  };

  const selectReason = () => {
    showModal({
      content: (
        <PickerModal
          title="Select Reason"
          data={LEAVE_REASONS}
          selected={selectedReason}
          onSelect={(item) => {
            setSelectedReason(item);
            hideModal();
          }}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.label}
          iconExtractor={(item) => item.icon as any}
        />
      ),
    });
  };

  const selectClinic = () => {
    showModal({
      content: (
        <ClinicModal
          selected={selectedClinic}
          onSelect={(item) => {
            setSelectedClinic(item);
            hideModal();
          }}
        />
      ),
    });
  };

  const isFormValid = useMemo(() => {
    if (!leaveType || !leavePeriod || !selectedReason || !dateRange.start) return false;
    if (leavePeriod.id === "full" && !dateRange.end) return false;
    if (leaveType.id === "MC" && !selectedClinic) return false;
    return true;
  }, [leaveType, leavePeriod, selectedReason, dateRange, selectedClinic]);

  // Handle clinic reset if leave type changes from MC
  useEffect(() => {
    if (leaveType?.id !== 'MC') {
      setSelectedClinic(null);
    }
  }, [leaveType]);

  const handleSubmit = async (attachedDocument: any, documentRefNo: string) => {
    if (!leaveType) {
      toast("Please select a leave type.");
      return;
    }
    if (!leavePeriod) {
      toast("Please select a leave period.");
      return;
    }

    const isFullDay = leavePeriod.id === "full";
    if (!dateRange.start || (isFullDay && !dateRange.end)) {
      toast(isFullDay ? "Please select a date range." : "Please select a date.");
      return;
    }

    if (leaveType.id === "MC" && !selectedClinic) {
      toast("Please select a clinic.");
      return;
    }

    if (!selectedReason) {
      toast("Please select a reason for your leave.");
      return;
    }

    showLoader("Submitting application...");

    try {
      const formData = new FormData();
      formData.append("leave_type", leaveType.id);
      formData.append("leave_period", leavePeriod.id);
      formData.append("reason", selectedReason.label);
      formData.append("remarks", remarks);
      formData.append("document_ref_no", documentRefNo);

      if (selectedClinic && leaveType.id === 'MC') {
        formData.append("clinic_id", selectedClinic.clinic_id.toString());
      }

      if (dateRange.start) {
        formData.append(
          "start_date",
          dateRange.start.toISOString().split("T")[0],
        );
      }
      
      if (!isFullDay && dateRange.start) {
        formData.append("end_date", dateRange.start.toISOString().split("T")[0]);
      } else if (dateRange.end) {
        formData.append("end_date", dateRange.end.toISOString().split("T")[0]);
      }

      if (attachedDocument) {
        // @ts-ignore
        formData.append("document", {
          uri: attachedDocument.uri,
          name: attachedDocument.name,
          type: attachedDocument.type,
        } as any);
      }

      const res = await addNewLeave(formData);
      hideLoader();
      if (res.status === "success") {
        toast({
          message: "Leave application submitted successfully!",
          variant: "success",
        });
        router.back();
      } else {
        toast({
          message: res.message || "Failed to submit application",
          variant: "error",
        });
      }
    } catch (err: any) {
      hideLoader();
      toast({
        message: err.message || "An unexpected error occurred",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    if (leaves.length === 0 && !loading && !error) {
      fetchLeaves();
    }
    if (!balances && !loading && !error) {
      fetchBalances();
    }
  }, [leaves.length, balances, loading, error, fetchLeaves, fetchBalances]);

  const handleWithdraw = (id: number) => {
    confirm({
      title: 'Withdraw Application',
      message: 'Are you sure you want to withdraw this leave application?',
      confirmText: 'Withdraw',
      isDestructive: true,
      onConfirm: async () => {
        const res = await withdraw(id);
        if (res.success) {
          hideSheet();
          toast({
            message: 'Leave application withdrawn successfully',
            variant: 'success',
          });
        } else {
          toast({
            message: res.error || 'Failed to withdraw application',
            variant: 'error',
          });
        }
      },
    });
  };

  const showDetails = (item: Leave) => {
    const statusKey = (item.manager_status as any) || 'Pending';
    const statusStyle = leaveStatusStyles[statusKey as keyof typeof leaveStatusStyles] || leaveStatusStyles.Pending;

    showSheet({
      content: (
        <View key={`leave-detail-${item.leave_id}`} style={{ gap: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={{ 
              backgroundColor: statusStyle.color + "15", 
              padding: 12, 
              borderRadius: 16 
            }}>
              <MaterialCommunityIcons name={statusStyle.icon as any} size={32} color={statusStyle.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: "800" }}>{item.leave_name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.duration_name} • {item.manager_status}</Text>
            </View>
          </View>

          <Divider />

          <View style={{ gap: 8 }}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: "700" }}>DURATION</Text>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>{item.leave_period}</Text>
          </View>

          {item.reason && (
            <View style={{ gap: 8 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: "700" }}>REASON</Text>
              <View style={{ backgroundColor: theme.colors.surfaceVariant + "40", padding: 16, borderRadius: 12 }}>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>{item.reason}</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-end' }}>
            <View style={{ gap: 4 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: "700" }}>APPLIED ON</Text>
              <Text variant="bodyMedium">{item.date}</Text>
            </View>
          </View>

          {item.manager_status === 'Pending' && (
            <Button 
              key="withdraw-action"
              mode="contained-tonal" 
              onPress={() => handleWithdraw(item.leave_id)}
              style={{ marginTop: 8, borderRadius: 12 }}
              buttonColor={theme.colors.errorContainer}
              textColor={theme.colors.onErrorContainer}
              contentStyle={{ height: 48 }}
            >
              WITHDRAW APPLICATION
            </Button>
          )}
        </View>
      ),
    });
  };

  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'All') return leaves;
    return leaves.filter((l) => l.manager_status === statusFilter);
  }, [leaves, statusFilter]);

  const stats = useMemo(() => {
    return {
      pending: leaves.filter(l => l.manager_status === 'Pending').length,
      approved: leaves.filter(l => l.manager_status === 'Approved').length,
      rejected: leaves.filter(l => l.manager_status === 'Rejected').length,
      total: leaves.length,
      annualBalance: balances?.balance || 0,
      medicalBalance: 0,
    };
  }, [leaves, balances]);

  return {
    leaves: filteredLeaves,
    allLeaves: leaves,
    balances,
    loading,
    error,
    stats,
    refreshLeaves: fetchLeaves,
    refreshBalances: fetchBalances,
    apply: addNewLeave,
    withdrawLeave: withdraw,
    clearLeaves: clear,
    showDetails,
    hasLeaves: leaves.length > 0,
    
    // Form Exports
    leaveType,
    selectLeaveType,
    leavePeriod,
    selectLeavePeriod,
    selectedReason,
    selectReason,
    remarks,
    setRemarks,
    selectedClinic,
    selectClinic,
    dateRange,
    setDateRange,
    isDatePickerVisible,
    setIsDatePickerVisible,
    isFormValid,
    handleSubmit,
  };
};
