import React, { useRef, useState } from "react";
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  TouchableOpacity,
} from "react-native";
import {
  useTheme,
  Text,
  Card,
  Divider,
  Avatar,
  Chip,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../../contexts/designContext";
import { useTabs } from "../../../contexts/tabContext";
import { useOverlay } from "../../../contexts/overlayContext";
import { useAuth } from "../../../contexts/authContext";
import ScrollTop from "../../../components/scrollTop";
import Tail from "../../../components/tail";
import { useRouter } from "expo-router";

export default function Settings() {
  const theme = useTheme();
  const tokens = useDesign();
  const { user } = useAuth();
  const { onScroll } = useTabs();
  const { toast } = useOverlay();
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

  const settings = [

    {
      title: "Preferences",
      subtitle: "Customize your app experience",
      icon: "tune-variant",
      onPress: () => toast("Coming soon"),
    },

    {
      title: "Help & Support",
      subtitle: "Get assistance and support",
      icon: "help-circle-outline",
      onPress: () => toast("Coming soon"),
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
          paddingBottom: tokens.spacing["3xl"],
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
