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
  Avatar,
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";

export default function Attendance() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { toast, performRefresh, confirm } = useOverlay();
  
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // We might want to show tab bar here depending on UX requirements
    // For now, let's keep it visible (false) or follow main.tsx pattern
    setHideTabBar(false);
  }, []);

  const handleRefresh = async () => {
    await performRefresh(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        message: "Attendance logs updated",
        variant: "success",
      });
    }, "Updating Logs...");
  };

  const toggleClock = () => {
    const action = isClockedIn ? "Clock Out" : "Clock In";
    confirm({
      title: `${action}?`,
      message: `Are you sure you want to ${action.toLowerCase()} at ${new Date().toLocaleTimeString()}?`,
      confirmText: action,
      onConfirm: () => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!isClockedIn) {
          setClockInTime(now);
          setIsClockedIn(true);
          toast({ message: `Clocked in at ${now}`, variant: "success" });
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
          toast({ message: `Clocked out at ${now}`, variant: "info" });
        }
      },
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const attendanceHistory = [
    { date: "May 14", in: "08:55 AM", out: "06:05 PM", status: "On Time" },
    { date: "May 13", in: "09:02 AM", out: "06:10 PM", status: "Late" },
    { date: "May 12", in: "08:45 AM", out: "06:00 PM", status: "On Time" },
    { date: "May 11", in: "08:50 AM", out: "06:15 PM", status: "On Time" },
  ];

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
          title="Attendance"
          subtitle="Track your daily presence"
          showBack
        />

        {/* Status Card */}
        <Card
          mode="elevated"
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: tokens.radii.xl,
            marginTop: tokens.spacing.md,
          }}
          contentStyle={{
            padding: tokens.spacing.xl,
            alignItems: 'center',
            gap: tokens.spacing.md,
          }}
        >
          <Avatar.Icon 
            size={64} 
            icon={isClockedIn ? "timer" : "timer-off"} 
            style={{ backgroundColor: isClockedIn ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
            color={isClockedIn ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
              {isClockedIn ? "Currently Clocked In" : "Not Clocked In"}
            </Text>
            {isClockedIn && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Since {clockInTime}
              </Text>
            )}
          </View>
          
          <Button 
            mode="contained" 
            onPress={toggleClock}
            style={{ width: '100%', borderRadius: tokens.radii.lg }}
            contentStyle={{ paddingVertical: tokens.spacing.xs }}
          >
            {isClockedIn ? "Clock Out" : "Clock In Now"}
          </Button>
        </Card>

        {/* History Section */}
        <View style={{ marginTop: tokens.spacing.xl, gap: tokens.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Recent Logs</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Icon source="refresh" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {attendanceHistory.map((log, index) => (
            <Card
              key={index}
              mode="contained"
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: tokens.radii.lg,
              }}
            >
              <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text variant="titleMedium">{log.date}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {log.in} - {log.out}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text 
                    variant="labelLarge" 
                    style={{ 
                      color: log.status === "On Time" ? theme.colors.primary : theme.colors.error,
                      fontWeight: 'bold'
                    }}
                  >
                    {log.status}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
