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
  Card,
  useTheme,
  Divider,
  Icon,
  Chip,
} from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import { useTabs } from "../../../../contexts/tabContext";
import { useOverlay } from "../../../../contexts/overlayContext";
import Header from "../../../../components/header";
import ScrollTop from "../../../../components/scrollTop";

export default function Newsflash() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { performRefresh } = useOverlay();
  
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

  const handleRefresh = async () => {
    await performRefresh(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }, "Checking for updates...");
  };

  const newsItems = [
    {
      id: 1,
      title: "New Office Wellness Program",
      category: "Benefits",
      date: "May 15, 2026",
      summary: "We are excited to announce a new wellness program starting next month, including gym memberships and mental health support.",
      image: "https://picsum.photos/seed/wellness/800/400"
    },
    {
      id: 2,
      title: "Quarterly Townhall Meeting",
      category: "Event",
      date: "May 12, 2026",
      summary: "Join us this Friday for the Q2 Townhall meeting. We'll be discussing our growth strategy and upcoming projects.",
      image: "https://picsum.photos/seed/townhall/800/400"
    },
    {
      id: 3,
      title: "IT System Maintenance",
      category: "System",
      date: "May 10, 2026",
      summary: "Scheduled maintenance for the internal HRMS portal will take place this Sunday from 2 AM to 6 AM.",
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
          title="Newsflash"
          subtitle="Latest updates and announcements"
          showBack
        />

        {/* Featured News */}
        <Card
          mode="elevated"
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: tokens.radii.xl,
            marginTop: tokens.spacing.md,
            overflow: 'hidden'
          }}
        >
          <Card.Cover source={{ uri: newsItems[0].image }} />
          <Card.Content style={{ padding: tokens.spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.xs }}>
              <Chip textStyle={{ fontSize: 10 }} style={{ height: 24, justifyContent: 'center' }}>{newsItems[0].category}</Chip>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{newsItems[0].date}</Text>
            </View>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{newsItems[0].title}</Text>
            <Text variant="bodyMedium" style={{ marginTop: tokens.spacing.xs, color: theme.colors.onSurfaceVariant }}>
              {newsItems[0].summary}
            </Text>
          </Card.Content>
        </Card>

        {/* Other News */}
        <View style={{ marginTop: tokens.spacing.xl, gap: tokens.spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Previous Updates</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Icon source="sync" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {newsItems.slice(1).map((item) => (
            <Card
              key={item.id}
              mode="contained"
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: tokens.radii.lg,
              }}
            >
              <Card.Content style={{ padding: tokens.spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                   <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.category.toUpperCase()}</Text>
                   <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.date}</Text>
                </View>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.title}</Text>
                <Text variant="bodySmall" numberOfLines={2} style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
                  {item.summary}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
