import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Text, Button, Card, useTheme, Divider, Icon } from "react-native-paper";
import { useDesign } from "../../../contexts/designContext";
import { useTabs } from "../../../contexts/tabContext";
import { useOverlay } from "../../../contexts/overlayContext";
import { useLoader } from "../../../contexts/loaderContext";
import Header from "../../../components/header";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Main() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { alert, confirm, toast, showModal, hideModal, showSheet, hideSheet } = useOverlay();
  const { showLoader, hideLoader, performRefresh, isRefreshing } = useLoader();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleRefresh = async () => {
    await performRefresh(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        message: "All data synchronized!",
        variant: "success",
      });
    }, "Syncing Data...");
  };

  const handleAlert = () => {
    alert({
      title: "Notification",
      message: "This is a simple alert message to inform you about something.",
      buttonText: "Understood",
    });
  };

  const handleConfirm = () => {
    confirm({
      title: "Are you sure?",
      message: "This action will permanently delete the item. This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Keep it",
      isDestructive: true,
      onConfirm: () => toast("Item deleted successfully"),
    });
  };

  const handleToast = () => {
    toast({
      message: "Changes saved successfully!",
      variant: "success",
      actionLabel: "Undo",
      onAction: () => alert({ title: "Undo", message: "Action has been reversed." }),
    });
  };

  const handleLoader = () => {
    showLoader("Processing your request...");
    setTimeout(() => {
      hideLoader();
      toast({
        message: "Loading complete!",
        variant: "success",
      });
    }, 2000);
  };

  const handleModal = () => {
    showModal({
      content: (
        <View style={{ gap: tokens.spacing.md }}>
          <View style={{ paddingBottom: tokens.spacing.sm, marginBottom: tokens.spacing.xs }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Select Days</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Choose your preferred schedule</Text>
          </View>
          
          <View>
            {DAYS.map((day) => (
              <TouchableOpacity 
                key={day} 
                onPress={() => {
                  toggleDay(day);
                  toast(`Selected ${day}`);
                }}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  paddingVertical: tokens.spacing.sm,
                }}
              >
                <Text variant="bodyLarge">{day}</Text>
                <Icon 
                  source={selectedDays.includes(day) ? "check-circle" : "circle-outline"} 
                  size={24} 
                  color={selectedDays.includes(day) ? theme.colors.primary : theme.colors.outline} 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <Button 
            mode="contained" 
            onPress={hideModal} 
            style={{ marginTop: tokens.spacing.md, borderRadius: tokens.radii.pill }}
          >
            Apply Selection
          </Button>
        </View>
      ),
    });
  };

  const handleSheet = () => {
    showSheet({
      title: "Item Details",
      content: (
        <View style={{ gap: tokens.spacing.lg }}>
          <Text variant="bodyLarge" style={{ lineHeight: 24 }}>
            This is the new Page Sheet component. It's designed to provide an immersive experience 
            for detailed content, similar to how iOS handles item detail views.
          </Text>
          
          <Divider />
          
          <View style={{ gap: tokens.spacing.sm }}>
            <Text variant="titleMedium">Features</Text>
            {[
              "Immersive full-screen (90%) coverage",
              "Smooth slide-up spring animation",
              "Integrated header with close button",
              "Visual grabber indicator",
              "Optimized for long scrollable content"
            ].map((feature, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon source="check" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium">{feature}</Text>
              </View>
            ))}
          </View>

          <Divider />

          <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
            You can use this for displaying deep details about an item, long forms, 
            or complex interactive sub-pages without navigating away from the current context.
            It respects the top safe area insets and provides a professional feel.
          </Text>
        </View>
      ),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: tokens.spacing.xl,
          paddingBottom: tokens.spacing["3xl"],
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Header title="Overlay Demo" subtitle="Interactive Components" showBack />

        <Card
          mode="elevated"
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: tokens.radii.xl,
            marginTop: tokens.spacing.md,
          }}
          contentStyle={{
            padding: tokens.spacing.xl,
            gap: tokens.spacing.lg,
          }}
        >
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Explore the different types of interactive overlays available in the application.
          </Text>

          <Divider />

          <View style={{ gap: tokens.spacing.md }}>
            <View>
              <Text variant="titleMedium">Alert Dialog</Text>
              <Text variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
                Used for simple informational messages.
              </Text>
              <Button mode="outlined" onPress={handleAlert}>
                Show Alert
              </Button>
            </View>

            <Divider />

            <View>
              <Text variant="titleMedium">Confirmation Dialog</Text>
              <Text variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
                Used when a user needs to confirm an action.
              </Text>
              <Button mode="outlined" onPress={handleConfirm}>
                Show Confirm
              </Button>
            </View>

            <Divider />

            <View>
              <Text variant="titleMedium">Toast Notification</Text>
              <Text variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
                Non-intrusive feedback messages at the bottom.
              </Text>
              <Button mode="outlined" onPress={handleToast}>
                Show Toast  
              </Button>
            </View>

            <Divider />

            <View>
              <Text variant="titleMedium">Custom Modal</Text>
              <Text variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
                Flexible container for complex UI or forms.
              </Text>
              <Button mode="outlined" onPress={handleModal}>
                Show Modal
              </Button>
            </View>

            <Divider />

            <View>
              <Text variant="titleMedium">Page Sheet (iOS Style)</Text>
              <Text variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
                Immersive container for detailed content or long forms.
              </Text>
              <Button mode="outlined" onPress={handleSheet}>
                Show Sheet
              </Button>
            </View>

            <Divider />

            <View>
              <Text variant="titleMedium">Full Screen Loader</Text>
              <Text variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
                Blocks UI interaction during long operations.
              </Text>
              <Button mode="outlined" onPress={handleLoader}>
                Simulate 2s Loading
              </Button>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
