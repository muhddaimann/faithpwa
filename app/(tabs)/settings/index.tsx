import React, { useRef, useState } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  useTheme,
  Text,
  Card,
  Divider,
  Switch,
  Avatar,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../../contexts/designContext";
import { useTabs } from "../../../contexts/tabContext";
import { useOverlay } from "../../../contexts/overlayContext";
import { useAuth } from "../../../hooks/useAuth";
import { useAppTheme } from "../../../contexts/themeContext";
import ScrollTop from "../../../components/scrollTop";
import Tail from "../../../components/tail";
import { useRouter } from "expo-router";

export default function Settings() {
  const theme = useTheme();
  const tokens = useDesign();
  const { user } = useAuth();
  const { isDark, toggle: toggleTheme } = useAppTheme();
  const { onScroll } = useTabs();
  const { toast, showSheet } = useOverlay();
  const router = useRouter();

  const scrollRef = useRef<ScrollView | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;

    setShowScrollTop(offset > 200);

    onScroll(offset);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const handlePreferences = () => {
    showSheet({
      title: "App Preferences",
      content: (
        <View style={{ gap: tokens.spacing.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: tokens.spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="titleMedium">Dark Mode</Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Adjust the appearance of the application
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          </View>

          <Divider />

          <View style={{ gap: tokens.spacing.sm }}>
            <Text variant="titleSmall">Notification Settings</Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: tokens.spacing.xs,
              }}
              onPress={() => toast("Notification settings coming soon")}
            >
              <Text variant="bodyLarge">Push Notifications</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.outline}
              />
            </TouchableOpacity>
          </View>
        </View>
      ),
    });
  };

  const handleAbout = () => {
    showSheet({
      title: "About FAITH",
      content: (
        <View
          style={{
            gap: tokens.spacing.xl,
            alignItems: "center",
            paddingVertical: tokens.spacing.md,
          }}
        >
          <Avatar.Image
            source={require("../../../assets/img/logo.png")}
            size={80}
            style={{ backgroundColor: "transparent" }}
          />

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text variant="headlineSmall" style={{ fontWeight: "800" }}>
              FAITH Workspace
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Version 2.4.0 (Build 1024)
            </Text>
          </View>

          <Divider style={{ width: "100%" }} />

          <View style={{ width: "100%", gap: tokens.spacing.md }}>
            <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
              FAITH is your all-in-one workspace solution for modern teams. This
              mobile application is a companion to our powerful web platform.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL("https://faith.daythree.net")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: tokens.spacing.sm,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.lg,
                backgroundColor: theme.colors.primaryContainer,
              }}
            >
              <MaterialCommunityIcons
                name="earth"
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
              <View style={{ flex: 1 }}>
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "700",
                  }}
                >
                  Visit Web Version
                </Text>
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onPrimaryContainer,
                    opacity: 0.8,
                  }}
                >
                  faith.daythree.net
                </Text>
              </View>
              <MaterialCommunityIcons
                name="open-in-new"
                size={20}
                color={theme.colors.onPrimaryContainer}
              />
            </TouchableOpacity>
          </View>

          <Text
            variant="labelSmall"
            style={{
              color: theme.colors.outline,
              marginTop: tokens.spacing.lg,
            }}
          >
            © 2026 Daythree Business Services. All rights reserved.
          </Text>
        </View>
      ),
    });
  };

  const settings = [
    {
      title: "Preferences",
      subtitle: "Customize your app experience",
      icon: "tune-variant",
      onPress: handlePreferences,
    },

    {
      title: "About App",
      subtitle: "Version info and platform links",
      icon: "information-outline",
      onPress: handleAbout,
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: tokens.spacing.md,
          paddingBottom: tokens.spacing["3xl"] * 2,
          paddingHorizontal: tokens.spacing.lg,
          gap: tokens.spacing.lg,
        }}
      >
        <Tail
          username={user?.name}
          designation={user?.designation}
          staffId={user?.staffId}
          avatarText={user?.avatarText}
          onUpdateProfilePress={() => router.push("settings/update")}
        />
        <Card
          mode="contained"
          style={{
            borderRadius: tokens.radii.xl,
            backgroundColor: theme.colors.surface,
          }}
        >
          <View>
            {settings.map((item, index) => (
              <View key={item.title}>
                <TouchableOpacity activeOpacity={0.9} onPress={item.onPress}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: tokens.spacing.md,
                      paddingHorizontal: tokens.spacing.lg,
                      paddingVertical: tokens.spacing.lg,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: tokens.radii.lg,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.surfaceVariant,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={22}
                        color={theme.colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        variant="titleSmall"
                        style={{
                          fontWeight: "700",
                        }}
                      >
                        {item.title}
                      </Text>

                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          marginTop: 2,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    </View>

                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                </TouchableOpacity>

                {index !== settings.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
