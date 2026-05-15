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
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";

export default function Leave() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { toast, showSheet, hideModal } = useOverlay();
  
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setHideTabBar(false);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleApplyLeave = () => {
    showSheet({
      title: "Apply for Leave",
      content: (
        <View style={{ gap: tokens.spacing.lg }}>
          <Text variant="bodyMedium">
            Fill in the details below to submit your leave request. This will be sent to your supervisor for approval.
          </Text>
          
          <Divider />
          
          <View style={{ gap: tokens.spacing.md }}>
            <Text variant="titleSmall">Select Leave Type</Text>
            {["Annual Leave", "Medical Leave", "Unpaid Leave", "Emergency Leave"].map((type) => (
              <TouchableOpacity 
                key={type} 
                style={{ 
                  padding: tokens.spacing.md, 
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: tokens.radii.md,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
                onPress={() => {
                  toast(`Selected ${type}`);
                }}
              >
                <Text>{type}</Text>
                <Icon source="chevron-right" size={20} />
              </TouchableOpacity>
            ))}
          </View>

          <Button 
            mode="contained" 
            onPress={() => {
              toast({ message: "Leave request submitted!", variant: "success" });
              // In a real app, you'd close the sheet here
            }}
            style={{ marginTop: tokens.spacing.md }}
          >
            Submit Request
          </Button>
        </View>
      )
    });
  };

  const leaveBalances = [
    { title: "Annual", used: 5, total: 14, icon: "calendar-star", color: "#4CAF50" },
    { title: "Medical", used: 2, total: 10, icon: "medical-bag", color: "#F44336" },
    { title: "Unpaid", used: 0, total: 0, icon: "cash-off", color: "#FF9800" },
  ];

  const recentApplications = [
    { type: "Annual Leave", date: "May 20 - May 22", status: "Approved", days: 3 },
    { type: "Medical Leave", date: "May 05", status: "Approved", days: 1 },
    { type: "Annual Leave", date: "Jun 15 - Jun 16", status: "Pending", days: 2 },
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
          title="Leave Management"
          subtitle="View balances and apply for leave"
          showBack
        />

        {/* Leave Balances Grid */}
        <View style={{ flexDirection: 'row', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
          {leaveBalances.map((item, index) => (
            <Card
              key={index}
              mode="elevated"
              style={{
                flex: 1,
                backgroundColor: theme.colors.surface,
                borderRadius: tokens.radii.lg,
              }}
            >
              <Card.Content style={{ alignItems: 'center', padding: tokens.spacing.md }}>
                <Icon source={item.icon} size={28} color={item.color} />
                <Text variant="labelMedium" style={{ marginTop: tokens.spacing.xs }}>{item.title}</Text>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{item.total - item.used}</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Left</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Button 
          mode="contained" 
          onPress={handleApplyLeave}
          style={{ 
            marginTop: tokens.spacing.xl, 
            borderRadius: tokens.radii.pill,
          }}
          icon="plus"
        >
          Apply for Leave
        </Button>

        {/* History Section */}
        <View style={{ marginTop: tokens.spacing.xl, gap: tokens.spacing.md }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Recent Applications</Text>
          
          {recentApplications.map((app, index) => (
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
                  <Text variant="titleMedium">{app.type}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {app.date} ({app.days} days)
                  </Text>
                </View>
                <View style={{ 
                  backgroundColor: app.status === "Approved" ? "#E8F5E9" : "#FFF3E0", 
                  paddingHorizontal: 12, 
                  paddingVertical: 4, 
                  borderRadius: 12 
                }}>
                  <Text 
                    variant="labelLarge" 
                    style={{ 
                      color: app.status === "Approved" ? "#2E7D32" : "#EF6C00",
                      fontWeight: 'bold'
                    }}
                  >
                    {app.status}
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
