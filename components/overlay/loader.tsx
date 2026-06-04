import React from "react";
import { View, Animated, Platform } from "react-native";
import { ActivityIndicator, Portal, useTheme, Text } from "react-native-paper";
import { useDesign } from "../../contexts/designContext";

type Props = {
  visible: boolean;
  message?: string;
};

export function OverlayLoader({ visible, message }: Props) {
  const theme = useTheme();
  const tokens = useDesign();
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 200 : 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 9999,
          opacity,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.backdrop,
            justifyContent: "center",
            alignItems: "center",
            gap: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.xl,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.onPrimary} />

          {message && (
            <Text
              variant="bodyLarge"
              style={{
                color: theme.colors.onPrimary,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {message}
            </Text>
          )}
        </View>
      </Animated.View>
    </Portal>
  );
}
