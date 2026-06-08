import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import { useRoom } from "../../../../hooks/useRoom";
import { Room as RoomType } from "../../../../contexts/api/room";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";
import RoomBento from "../../../../components/room/roomBento";
import RoomList from "../../../../components/room/roomList";
import RoomBookingSheet from "../../../../components/room/roomBookingSheet";

export default function Room() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { showSheet, hideSheet } = useOverlay();
  const { rooms, prepareBooking } = useRoom();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRoomPress = async (room: RoomType) => {
    const timeSlots = await prepareBooking(room);
    if (timeSlots) {
      showSheet({
        content: <RoomBookingSheet room={room} timeSlots={timeSlots} onDismiss={hideSheet} />,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: tokens.spacing.lg,
          paddingBottom: tokens.spacing["3xl"],
          gap: tokens.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Room Booking"
          subtitle="Check availability and manage reservations"
          showBack
        />
        <RoomBento />
        <RoomList rooms={rooms} onRoomPress={handleRoomPress} />
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
