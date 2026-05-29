import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  useTheme,
  Divider,
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import Header from "../../../../components/header";
import { useLeave } from "../../../../hooks/useLeave";
import { useRouter } from "expo-router";
import PickerModal from "../../../../components/pickerModal";

const LEAVE_TYPES = [
  { id: "AL", label: "Annual Leave", icon: "calendar-star" },
  { id: "MC", label: "Medical Leave", icon: "medical-bag" },
  { id: "UL", label: "Unpaid Leave", icon: "cash-remove" },
  { id: "EL", label: "Emergency Leave", icon: "alert-octagon" },
];

const LEAVE_PERIODS = [
  { id: "full", label: "Full Day", icon: "clock-outline" },
  { id: "morning", label: "First Half", icon: "weather-sunny" },
  { id: "afternoon", label: "Second Half", icon: "weather-night" },
];

export default function ApplyLeave() {
  const theme = useTheme();
  const tokens = useDesign();
  const router = useRouter();
  const { setHideTabBar } = useTabs();
  const { toast, showLoader, hideLoader, showModal, hideModal } = useOverlay();
  const { apply } = useLeave();

  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [leavePeriod, setLeavePeriod] = useState(LEAVE_PERIODS[0]);

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const handleSelectLeaveType = () => {
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

  const handleSelectLeavePeriod = () => {
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

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast("Please provide a reason for your leave.");
      return;
    }

    showLoader("Submitting application...");
    // Mocking a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    hideLoader();
    toast({
      message: "Leave application submitted successfully!",
      variant: "success",
    });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: tokens.spacing.lg,
            paddingBottom: tokens.spacing["3xl"],
            gap: tokens.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="New Application"
            subtitle="Request time off"
            showBack
          />

          <View style={{ gap: tokens.spacing.lg }}>
            <View style={{ gap: tokens.spacing.md }}>
              <Text variant="titleMedium" style={{ fontWeight: "700" }}>Leave Details</Text>
              
              <Pressable onPress={handleSelectLeaveType}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Leave Type"
                    value={leaveType.label}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineStyle={{ borderRadius: tokens.radii.lg }}
                  />
                </View>
              </Pressable>

              <Pressable onPress={handleSelectLeavePeriod}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Leave Period"
                    value={leavePeriod.label}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    outlineStyle={{ borderRadius: tokens.radii.lg }}
                  />
                </View>
              </Pressable>

              <TextInput
                mode="outlined"
                label="Reason"
                placeholder="e.g. Family matters"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                outlineStyle={{ borderRadius: tokens.radii.lg }}
              />
            </View>

            <Divider />

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{
                borderRadius: tokens.radii.pill,
                paddingVertical: 6,
              }}
              contentStyle={{ height: 48 }}
            >
              Submit Application
            </Button>
            
            <Text variant="bodySmall" style={{ textAlign: 'center', opacity: 0.6, fontStyle: 'italic' }}>
              Your application will be sent to your manager for approval.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
