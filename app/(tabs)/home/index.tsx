import React, { useRef, useState } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  TouchableOpacity,
} from "react-native";
import { useTheme, Text, Card, Icon, Avatar } from "react-native-paper";
import { useDesign } from "../../../contexts/designContext";
import ScrollTop from "../../../components/scrollTop";
import { useTabs } from "../../../contexts/tabContext";
import Header from "../../../components/header";
import { useRouter } from "expo-router";

export default function Home() {
  const theme = useTheme();
  const tokens = useDesign();
  const { onScroll } = useTabs();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
    onScroll(offset);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const features = [
    {
      title: "Attendance",
      icon: "calendar-check",
      path: "/home/attendance",
      color: "#4A90E2",
      description: "Clock in/out",
    },
    {
      title: "Leave",
      icon: "calendar-remove",
      path: "/home/leave",
      color: "#F5A623",
      description: "Apply for leave",
    },
    {
      title: "Newsflash",
      icon: "bullhorn",
      path: "/home/newsflash",
      color: "#7ED321",
      description: "Company updates",
    },
    {
      title: "Performance",
      icon: "chart-line",
      path: "/home/performance",
      color: "#BD10E0",
      description: "Your metrics",
    },
  ];

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
          gap: tokens.spacing.xl
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Summary */}
        <View style={{ flexDirection: "row", gap: tokens.spacing.md }}>
          <Card
            mode="contained"
            style={{ flex: 1, backgroundColor: theme.colors.primaryContainer }}
          >
            <Card.Content>
              <Text variant="labelMedium">Shift Progress</Text>
              <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                6h 45m
              </Text>
            </Card.Content>
          </Card>
          <Card
            mode="contained"
            style={{
              flex: 1,
              backgroundColor: theme.colors.secondaryContainer,
            }}
          >
            <Card.Content>
              <Text variant="labelMedium">Satisfaction</Text>
              <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                98%
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Feature Grid */}
        <View style={{ marginTop: tokens.spacing.sm }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: tokens.spacing.md }}
          >
            Quick Actions
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: tokens.spacing.md,
            }}
          >
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={{ width: "47%" }}
                onPress={() => router.push(feature.path as any)}
              >
                <Card
                  mode="elevated"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: tokens.radii.xl,
                  }}
                >
                  <Card.Content
                    style={{
                      padding: tokens.spacing.lg,
                      alignItems: "center",
                      gap: tokens.spacing.xs,
                    }}
                  >
                    <Avatar.Icon
                      size={48}
                      icon={feature.icon}
                      style={{ backgroundColor: feature.color + "20" }}
                      color={feature.color}
                    />
                    <Text
                      variant="titleMedium"
                      style={{ fontWeight: "bold", marginTop: 4 }}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {feature.description}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overlay Demo Link */}
        <TouchableOpacity onPress={() => router.push("/home/main")}>
          <Card mode="outlined" style={{ borderStyle: "dashed" }}>
            <Card.Content
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: tokens.spacing.md,
              }}
            >
              <Icon source="flask" size={24} color={theme.colors.outline} />
              <View>
                <Text variant="titleSmall">Components Demo</Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Test UI overlays and buttons
                </Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
