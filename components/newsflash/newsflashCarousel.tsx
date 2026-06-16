import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Dimensions,
  Pressable,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDesign } from "../../contexts/designContext";
import { newsflashPriorities } from "../../constants/newsflash";
import { useNewsflash } from "../../hooks/useNewsflash";
import { formatNewsDate } from "../../helpers/newsflash";

const { width } = Dimensions.get("window");

const SIDE_PADDING = 24;
const SPACING = 16;
const CARD_WIDTH = width - SIDE_PADDING * 2 - 32;

export default function NewsflashCarousel() {
  const { colors } = useTheme();
  const tokens = useDesign();
  const router = useRouter();
  const { broadcasts, loading, showDetails, isAcknowledged } = useNewsflash(3);

  const normalizePriority = (p?: string): keyof typeof newsflashPriorities => {
    if (!p) return "Normal";
    const normalized = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    if (normalized === "Critical" || normalized === "Important" || normalized === "Normal") {
      return normalized as keyof typeof newsflashPriorities;
    }
    return "Normal";
  };

  const translateX = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (broadcasts.length === 0) return;

    // Reset and start progress bar animation
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: false, // width cannot use native driver
    }).start();

    const interval = setInterval(() => {
      const nextIndex =
        activeIndex >= broadcasts.length - 1 ? 0 : activeIndex + 1;
      const toValue = -nextIndex * (CARD_WIDTH + SPACING);

      Animated.timing(translateX, {
        toValue,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, broadcasts.length]);

  if (loading || broadcasts.length === 0) {
    return null; // Or a skeleton/placeholder
  }

  return (
    <View
      style={{
        gap: tokens.spacing.sm,
      }}
    >
      <View style={{ overflow: "hidden" }}>
        <Animated.View
          style={{
            flexDirection: "row",
            gap: SPACING,
            transform: [{ translateX }],
          }}
        >
          {broadcasts.map((item, index) => {
            const priorityKey = normalizePriority(item.BroadcastPriority);
            const priority = newsflashPriorities[priorityKey];
            const acknowledged = isAcknowledged(item);
            const isActive = index === activeIndex;

            return (
              <Pressable
                key={`${item.ID}-${index}`}
                onPress={() => showDetails(item)}
                style={({ pressed }) => ({
                  width: CARD_WIDTH,
                  opacity: pressed ? 0.92 : 1,
                })}
              >
                <View
                  style={{
                    backgroundColor: colors.surface,
                    opacity: acknowledged ? 0.72 : 1,
                    borderRadius: 32,
                    padding: tokens.spacing.lg,
                    gap: tokens.spacing.lg,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: priority.color + "25",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: -18,
                      right: -10,
                      opacity: 0.08,
                      transform: [
                        {
                          rotate: "-12deg",
                        },
                      ],
                    }}
                  >
                    <MaterialCommunityIcons
                      name={priority.icon}
                      size={140}
                      color={priority.color}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: colors.surfaceVariant,
                      }}
                    >
                      <Text
                        variant="labelSmall"
                        style={{
                          fontWeight: "700",
                          color: colors.onSurfaceVariant,
                        }}
                      >
                        {item.BroadcastType}
                      </Text>
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: priority.color + "18",
                      }}
                    >
                      <Text
                        variant="labelSmall"
                        style={{
                          fontWeight: "800",
                          color: priority.color,
                        }}
                      >
                        {item.BroadcastPriority}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      gap: 10,
                    }}
                  >
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: "800",
                        lineHeight: 26,
                      }}
                    >
                      {item.NewsName}
                    </Text>

                    <Text
                      variant="bodyMedium"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        color: colors.onSurfaceVariant,
                        lineHeight: 22,
                      }}
                    >
                      {item.Description}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      variant="bodySmall"
                      style={{
                        color: colors.onSurfaceVariant,
                      }}
                    >
                      {acknowledged ? "Acknowledged" : formatNewsDate(item.CreatedDateTime)}
                    </Text>

                    <MaterialCommunityIcons
                      name={acknowledged ? "check-all" : "gesture-tap"}
                      size={16}
                      color={
                        acknowledged ? colors.onSurfaceVariant : colors.primary
                      }
                    />
                  </View>

                  {/* Progress Indicator */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: colors.surfaceVariant,
                      opacity: 0.5,
                    }}
                  >
                    {isActive && (
                      <Animated.View
                        style={{
                          height: "100%",
                          backgroundColor: priority.color,
                          width: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        }}
                      />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>

      <View
        style={{
          paddingHorizontal: tokens.spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <Text
          variant="bodySmall"
          style={{
            color: colors.onSurfaceVariant,
          }}
        >
          Showing latest 3 memos.
        </Text>

        <Pressable
          onPress={() => router.push("/home/newsflash")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="bodySmall"
            style={{
              color: colors.primary,
              fontWeight: "700",
            }}
          >
            View all here
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
