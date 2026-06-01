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
import DocumentModal from "../../../../components/documentModal";
import DatePicker from "../../../../components/datePicker";
import { useUpload } from "../../../../hooks/useUpload";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ApplyLeave() {
  const theme = useTheme();
  const tokens = useDesign();
  const router = useRouter();
  const { setHideTabBar } = useTabs();
  const { toast, showLoader, hideLoader, showModal, hideModal, modalVisible } = useOverlay();
  const { 
    apply,
    leaveType,
    selectLeaveType,
    leavePeriod,
    selectLeavePeriod,
    selectedReason,
    selectReason
  } = useLeave();
  
  const { 
    attachedDocument, 
    setAttachedDocument, 
    documentRefNo,
    setDocumentRefNo,
    pick,
    error,
    setError
  } = useUpload();

  const [remarks, setRemarks] = useState("");
  
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  useEffect(() => {
    if (error) {
      toast({ message: error, variant: "error" });
      setError(null);
    }
  }, [error]);

  const handleAttachDocument = async () => {
    const doc = await pick();
    if (doc) {
      showRefModal(doc);
    }
  };

  const showRefModal = (doc: { name: string; type: string }) => {
    showModal({
      content: (
        <DocumentModal
          attachedFile={doc}
          refNo={documentRefNo}
          onRefNoChange={setDocumentRefNo}
          onPick={async () => {
            const nextDoc = await pick();
            if (nextDoc) showRefModal(nextDoc);
          }}
          onConfirm={() => hideModal()}
          onCancel={() => {
            setAttachedDocument(null);
            hideModal();
          }}
        />
      ),
    });
  };

  useEffect(() => {
    if (modalVisible && attachedDocument) {
      showRefModal(attachedDocument);
    }
  }, [documentRefNo]);

  const handleSubmit = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast("Please select a date range.");
      return;
    }

    if (!selectedReason) {
      toast("Please select a reason for your leave.");
      return;
    }

    showLoader("Submitting application...");
    
    try {
      const formData = new FormData();
      formData.append('leave_type', leaveType.id);
      formData.append('leave_period', leavePeriod.id);
      formData.append('reason', selectedReason.label);
      formData.append('remarks', remarks);
      formData.append('document_ref_no', documentRefNo);
      
      if (dateRange.start) {
        formData.append('start_date', dateRange.start.toISOString().split('T')[0]);
      }
      if (dateRange.end) {
        formData.append('end_date', dateRange.end.toISOString().split('T')[0]);
      }

      if (attachedDocument) {
        // @ts-ignore
        formData.append('document', {
          uri: attachedDocument.uri,
          name: attachedDocument.name,
          type: attachedDocument.type,
        } as any);
      }

      const res = await apply(formData);
      if (res.status === 'success') {
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
      toast({
        message: err.message || "An unexpected error occurred",
        variant: "error",
      });
    } finally {
      hideLoader();
    }
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
              
              <Pressable onPress={() => setIsDatePickerVisible(true)}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Leave Dates"
                    value={
                      dateRange.start && dateRange.end
                        ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                        : "Select dates"
                    }
                    editable={false}
                    left={<TextInput.Icon icon="calendar" />}
                    outlineStyle={{ borderRadius: tokens.radii.lg }}
                  />
                </View>
              </Pressable>

              <Pressable onPress={selectLeaveType}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Leave Type"
                    value={leaveType.label}
                    editable={false}
                    outlineStyle={{ borderRadius: tokens.radii.lg }}
                  />
                </View>
              </Pressable>

              <Pressable onPress={selectLeavePeriod}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Leave Period"
                    value={leavePeriod.label}
                    editable={false}
                    outlineStyle={{ borderRadius: tokens.radii.lg }}
                  />
                </View>
              </Pressable>

              <Pressable onPress={selectReason}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Reason"
                    value={selectedReason.label}
                    editable={false}
                    outlineStyle={{ borderRadius: tokens.radii.lg }}
                  />
                </View>
              </Pressable>

              <TextInput
                mode="outlined"
                label="Remarks (Optional)"
                placeholder="Any additional notes..."
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
                outlineStyle={{ borderRadius: tokens.radii.lg }}
              />
            </View>

            <View style={{ gap: tokens.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>Attachment</Text>
                {attachedDocument && (
                   <Button 
                    mode="text" 
                    onPress={() => setAttachedDocument(null)}
                    textColor={theme.colors.error}
                    compact
                  >
                    Remove
                  </Button>
                )}
              </View>

              {!attachedDocument ? (
                <Pressable onPress={handleAttachDocument}>
                  <View style={{
                    borderWidth: 1,
                    borderColor: theme.colors.outline + '40',
                    borderStyle: 'dashed',
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing.xl,
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: theme.colors.surfaceVariant + '20'
                  }}>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={32} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                      Upload MC or Supporting Doc
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.6 }}>
                      JPG, PNG or PDF (Max 1MB)
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: tokens.radii.lg,
                  backgroundColor: theme.colors.primaryContainer + '40',
                  borderWidth: 1,
                  borderColor: theme.colors.primary + '20'
                }}>
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MaterialCommunityIcons 
                      name={attachedDocument.type.includes('pdf') ? 'file-pdf-box' : 'image'} 
                      size={24} 
                      color={theme.colors.onPrimary} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '700' }}>
                      {attachedDocument.name}
                    </Text>
                    <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                      {attachedDocument.type.split('/')[1].toUpperCase()} • Ready to upload
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
                </View>
              )}
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

      <DatePicker
        visible={isDatePickerVisible}
        onDismiss={() => setIsDatePickerVisible(false)}
        variant="range"
        title="Select Leave Dates"
        rangeValue={dateRange}
        onRangeChange={(range) => setDateRange(range)}
      />
    </View>
  );
}
