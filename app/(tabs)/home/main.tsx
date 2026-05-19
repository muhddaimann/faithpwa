import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  Text,
  Button,
  Card,
  useTheme,
  Divider,
  Icon,
  SegmentedButtons,
} from "react-native-paper";
import { useDesign } from "../../../contexts/designContext";
import { useTabs } from "../../../contexts/tabContext";
import { useOverlay } from "../../../contexts/overlayContext";
import Header from "../../../components/header";
import ScrollTop from "../../../components/scrollTop";
import NoData from "../../../components/noData";

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
  const {
    alert,
    confirm,
    toast,
    showModal,
    hideModal,
    showSheet,
    showLoader,
    hideLoader,
    performRefresh,
  } = useOverlay();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [demoMode, setDemoMode] = useState("content");

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
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

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAlert = () => {
    alert({
      title: "Notification",
      message: "This is a simple alert message to inform you about something.",
      buttonText: "Understood",
    });
  };

  const handleNormalConfirm = () => {
    confirm({
      title: "Save Changes?",
      message: "Would you like to save your current progress before leaving?",
      confirmText: "Save",
      cancelText: "Discard",
      onConfirm: () => toast({ message: "Changes saved", variant: "success" }),
    });
  };

  const handleDestructiveConfirm = () => {
    confirm({
      title: "Are you sure?",
      message:
        "This action will permanently delete the item. This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Keep it",
      isDestructive: true,
      onConfirm: () => toast("Item deleted successfully"),
    });
  };

  const handleToast = (variant: any = "default") => {
    const messages = {
      success: "Changes saved successfully!",
      error: "Failed to update record.",
      warning: "Storage space is almost full.",
      info: "A new update is available.",
      default: "This is a standard notification.",
    };

    toast({
      message: messages[variant as keyof typeof messages] || messages.default,
      variant,
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
          <View
            style={{
              paddingBottom: tokens.spacing.sm,
              marginBottom: tokens.spacing.xs,
            }}
          >
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              Select Days
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Choose your preferred schedule
            </Text>
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
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: tokens.spacing.sm,
                }}
              >
                <Text variant="bodyLarge">{day}</Text>
                <Icon
                  source={
                    selectedDays.includes(day)
                      ? "check-circle"
                      : "circle-outline"
                  }
                  size={24}
                  color={
                    selectedDays.includes(day)
                      ? theme.colors.primary
                      : theme.colors.outline
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={hideModal}
            style={{
              marginTop: tokens.spacing.md,
              borderRadius: tokens.radii.pill,
            }}
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
            This is the new Page Sheet component. It's designed to provide an
            immersive experience for detailed content, similar to how iOS
            handles item detail views.
          </Text>

          <Divider />

          <View style={{ gap: tokens.spacing.sm }}>
            <Text variant="titleMedium">Features</Text>
            {[
              "Immersive full-screen (90%) coverage",
              "Smooth slide-up spring animation",
              "Integrated header with close button",
              "Visual grabber indicator",
              "Optimized for long scrollable content",
            ].map((feature, i) => (
              <View
                key={i}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Icon source="check" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium">{feature}</Text>
              </View>
            ))}
          </View>

          <Divider />

          <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
            You can use this for displaying deep details about an item, long
            forms, or complex interactive sub-pages without navigating away from
            the current context. It respects the top safe area insets and
            provides a professional feel.
          </Text>
        </View>
      ),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: tokens.spacing.xl,
          paddingBottom: tokens.spacing["3xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Overlay Demo"
          subtitle="Interactive Components"
          showBack
        />

        <SegmentedButtons
          value={demoMode}
          onValueChange={setDemoMode}
          buttons={[
            {
              value: "content",
              label: "Show Data",
              icon: "database",
            },
            {
              value: "empty",
              label: "Show Empty",
              icon: "database-off",
            },
          ]}
          style={{ marginTop: tokens.spacing.md }}
        />

        {demoMode === "content" ? (
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
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Explore the different types of interactive overlays available in the
              application.
            </Text>

            <Divider />

            <View style={{ gap: tokens.spacing.md }}>
              <View>
                <Text variant="titleMedium">Refresh Simulation</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Simulates background data fetching with a loader.
                </Text>
                <Button mode="outlined" onPress={handleRefresh}>
                  Refresh Data
                </Button>
              </View>

              <Divider />

              <View>
                <Text variant="titleMedium">Alert Dialog</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Used for simple informational messages.
                </Text>
                <Button mode="outlined" onPress={handleAlert}>
                  Show Alert
                </Button>
              </View>

              <Divider />

              <View>
                <Text variant="titleMedium">Confirmation Dialog</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Used when a user needs to confirm an action.
                </Text>
                <View style={{ flexDirection: "row", gap: tokens.spacing.sm }}>
                  <Button
                    mode="outlined"
                    onPress={handleNormalConfirm}
                    style={{ flex: 1, borderRadius: tokens.radii.lg }}
                  >
                    Normal
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleDestructiveConfirm}
                    style={{ flex: 1, borderRadius: tokens.radii.lg }}
                  >
                    Destructive
                  </Button>
                </View>
              </View>

              <Divider />

              <View>
                <Text variant="titleMedium">Toast Notification</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Non-intrusive feedback messages at the bottom.
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: tokens.spacing.xs,
                  }}
                >
                  {(["success", "error", "warning", "info"] as const).map((v) => (
                    <Button
                      key={v}
                      mode="outlined"
                      compact
                      onPress={() => handleToast(v)}
                      style={{ borderRadius: tokens.radii.md }}
                      labelStyle={{ fontSize: 12 }}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Button>
                  ))}
                </View>
              </View>

              <Divider />

              <View>
                <Text variant="titleMedium">Custom Modal</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Flexible container for complex UI or forms.
                </Text>
                <Button mode="outlined" onPress={handleModal}>
                  Show Modal
                </Button>
              </View>

              <Divider />

              <View>
                <Text variant="titleMedium">Page Sheet (iOS Style)</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Immersive container for detailed content or long forms.
                </Text>
                <Button mode="outlined" onPress={handleSheet}>
                  Show Sheet
                </Button>
              </View>

              <Divider />

              <View>
                <Text variant="titleMedium">Full Screen Loader</Text>
                <Text
                  variant="bodySmall"
                  style={{ marginBottom: tokens.spacing.sm }}
                >
                  Blocks UI interaction during long operations.
                </Text>
                <Button mode="outlined" onPress={handleLoader}>
                  Simulate 2s Loading
                </Button>
              </View>
            </View>
          </Card>
        ) : (
          <View style={{ marginTop: tokens.spacing["3xl"], flex: 1 }}>
            <NoData
              title="No Demo Data"
              description="You are currently viewing the empty state demonstration. Switch back to see the interactive components."
              icon="database-off"
              buttonLabel="Switch to Data"
              onPress={() => setDemoMode("content")}
            />
          </View>
        )}
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
