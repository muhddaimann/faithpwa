import React, { useRef, useState } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useDesign } from "../../../contexts/designContext";
import ScrollTop from "../../../components/scrollTop";
import { useTabs } from "../../../contexts/tabContext";
import Head from "../../../components/head";
import SectionHeader from "../../../components/section";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/authContext";
import { useStaff } from "../../../hooks/useStaff";
import { useAttendance } from "../../../hooks/useAttendance";
import { useOverlay } from "../../../contexts/overlayContext";
import PickerModal from "../../../components/pickerModal";
import AttendanceCard from "../../../components/attendance/attendanceCard";
import NewsflashCarousel from "../../../components/newsflash/newsflashCarousel";
import RowTwo from "../../../components/rowtwo";
import SessionFooter from "../../../components/sessionFooter";
import { useLeave } from "../../../hooks/useLeave";
import { useRoom } from "../../../hooks/useRoom";

export default function Home() {
  const theme = useTheme();
  const tokens = useDesign();
  const router = useRouter();
  const { user } = useAuth();
  const { staff, displayName, initials, welcomeMessage } = useStaff();
  const { stats: leaveStats } = useLeave();
  const { stats: roomStats, myBookings } = useRoom();
  const { operationView, setOperationView } = useAttendance();
  const { toast, showModal, hideModal } = useOverlay();
  const { onScroll } = useTabs();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const toastShown = useRef(false);

  React.useEffect(() => {
    if (staff && !toastShown.current) {
      toast({
        message: welcomeMessage,
        variant: "success",
      });
      toastShown.current = true;
    }
  }, [staff, welcomeMessage, toast]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 200);
    onScroll(offset);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAvatarPress = () => {
    showModal({
      content: (
        <PickerModal
          title="Account"
          data={[
            {
              id: "update",
              label: "Update Details",
              icon: "account-edit-outline" as const,
            },
            {
              id: "switch",
              label: operationView
                ? "Switch to Manager View"
                : "Switch to Operation View",
              icon: "swap-horizontal" as const,
            },
          ]}
          onSelect={(item) => {
            hideModal();
            if (item.id === "update") {
              // Land on the settings index first, then push the update screen
              // a beat later (same pattern as the nav bar's "Apply Leave") so
              // the stack doesn't end up with a duplicate update entry.
              router.navigate("/settings");
              setTimeout(() => {
                router.push("/settings/update");
              }, 100);
              return;
            }
            const next = !operationView;
            setOperationView(next);
            toast({
              message: next
                ? "Switched to Operation view"
                : "Switched to Manager view",
              variant: "info",
            });
          }}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.label}
          iconExtractor={(item) => item.icon}
        />
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
          paddingTop: tokens.spacing.md,
          paddingBottom: tokens.spacing["3xl"],
          paddingHorizontal: tokens.spacing.lg,
          gap: tokens.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Head
          greeting={getGreeting()}
          username={displayName || user?.first_name || "User"}
          designation={staff?.designation_name || user?.designation_name || ""}
          avatarText={initials || user?.initials || "U"}
          onNotificationPress={() => router.push("home/newsflash")}
          onAvatarPress={handleAvatarPress}
        />
        <AttendanceCard />

        <SectionHeader
          icon="calendar-check"
          title="Leave"
          subtitle="Manage leave applications"
          actionLabel="See All"
          actionRoute="home/leave"
        />

        <RowTwo
          left={{
            icon: "clock-outline",
            label: "Pending Leave",
            value: leaveStats.pending.toString(),
            color: "#F59E0B",
          }}
          right={{
            icon: "briefcase-outline",
            label: "Annual Balance",
            value: leaveStats.annualBalance.toString(),
            color: "#10B981",
          }}
        />

        <NewsflashCarousel />

        <SectionHeader
          icon="door-sliding"
          title="Room Booking"
          subtitle="Reserve meeting rooms"
          actionLabel="See All"
          actionRoute="home/room"
        />

        <RowTwo
          left={{
            icon: "door-open",
            label: "Active Booking",
            value: roomStats.activeBookings.toString(),
            color: "#3B82F6",
          }}
          right={{
            icon: "history",
            label: "Booking History",
            value: myBookings.length.toString(),
            color: "#8B5CF6",
          }}
        />

        <SessionFooter />
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
