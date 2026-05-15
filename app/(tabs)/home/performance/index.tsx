import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  Text,
  Card,
  useTheme,
  Divider,
  ProgressBar,
  Icon,
  Avatar,
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";

export default function Performance() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  
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

  const kpis = [
    { label: "Customer Satisfaction", value: 0.92, display: "92%", icon: "emoticon-happy-outline" },
    { label: "Avg. Response Time", value: 0.75, display: "4.2m", icon: "clock-fast" },
    { label: "Resolution Rate", value: 0.88, display: "88%", icon: "check-decagram-outline" },
  ];

  const feedbacks = [
    {
      id: 1,
      from: "Manager",
      text: "Excellent handling of the difficult case yesterday. Your patience is a great asset to the team.",
      date: "May 14",
      avatar: "M"
    },
    {
      id: 2,
      from: "System",
      text: "You've exceeded your target resolution rate for 3 consecutive weeks! Keep up the great work.",
      date: "May 10",
      avatar: "S"
    }
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
          title="Performance"
          subtitle="Your growth and metrics"
          showBack
        />

        {/* Overall Score */}
        <Card
          mode="elevated"
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: tokens.radii.xl,
            marginTop: tokens.spacing.md,
          }}
        >
          <Card.Content style={{ padding: tokens.spacing.xl, alignItems: 'center' }}>
            <Text variant="labelLarge" style={{ color: 'rgba(255,255,255,0.8)' }}>Overall Rating</Text>
            <Text variant="displayMedium" style={{ color: 'white', fontWeight: 'bold', marginVertical: tokens.spacing.xs }}>4.8</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Icon key={s} source="star" size={20} color={s <= 4 ? "#FFD700" : "rgba(255,255,255,0.3)"} />
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* KPI Section */}
        <View style={{ marginTop: tokens.spacing.xl, gap: tokens.spacing.md }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Key Metrics</Text>
          
          <View style={{ gap: tokens.spacing.lg }}>
            {kpis.map((kpi, index) => (
              <View key={index}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon source={kpi.icon} size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium">{kpi.label}</Text>
                  </View>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{kpi.display}</Text>
                </View>
                <ProgressBar progress={kpi.value} color={theme.colors.primary} style={{ height: 8, borderRadius: 4 }} />
              </View>
            ))}
          </View>
        </View>

        {/* Feedback Section */}
        <View style={{ marginTop: tokens.spacing["2xl"], gap: tokens.spacing.md }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Recent Feedback</Text>
          
          {feedbacks.map((fb) => (
            <Card
              key={fb.id}
              mode="contained"
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: tokens.radii.lg,
              }}
            >
              <Card.Content style={{ flexDirection: 'row', gap: tokens.spacing.md }}>
                <Avatar.Text size={40} label={fb.avatar} style={{ backgroundColor: theme.colors.primaryContainer }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{fb.from}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{fb.date}</Text>
                  </View>
                  <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
                    "{fb.text}"
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
