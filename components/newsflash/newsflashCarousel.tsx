import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Dimensions,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDesign } from "../../contexts/designContext";
import { newsflashes, newsflashPriorities } from "../../constants/newsflash";

const { width } = Dimensions.get("window");

const SIDE_PADDING = 24;
const SPACING = 16;
const CARD_WIDTH = width - SIDE_PADDING * 2 - 32;

export default function NewsflashCarousel() {
  const { colors } = useTheme();
  const tokens = useDesign();
  const router = useRouter();

  const translateX = useRef(new Animated.Value(0)).current;
  const carouselData = newsflashes.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [acknowledgedIds, setAcknowledgedIds] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        activeIndex >= carouselData.length - 1 ? 0 : activeIndex + 1;
      const toValue = -nextIndex * (CARD_WIDTH + SPACING);

      Animated.timing(translateX, {
        toValue,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();

      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, carouselData.length]);

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
          {carouselData.map((item) => {
            const priority = newsflashPriorities[item.priority];
            const acknowledged = acknowledgedIds.includes(item.id);

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (!acknowledged) {
                    setAcknowledgedIds((prev) => [...prev, item.id]);
                  }
                }}
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
                        {item.type}
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
                        {item.priority}
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
                      {item.title}
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
                      {item.content}
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
                      {acknowledged ? "Acknowledged" : item.timestamp}
                    </Text>

                    <MaterialCommunityIcons
                      name={acknowledged ? "check-all" : "gesture-tap"}
                      size={16}
                      color={
                        acknowledged ? colors.onSurfaceVariant : colors.primary
                      }
                    />
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
