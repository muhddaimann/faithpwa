import React, { useState, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TextInput as RNTextInput,
} from "react-native";
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import { useDesign } from "../contexts/designContext";
import { useAuth } from "../contexts/authContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRef = useRef<RNTextInput>(null);

  const theme = useTheme();
  const tokens = useDesign();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await signIn(username.trim(), password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: 999,
          backgroundColor: theme.colors.primary,
          top: 120,
          left: -140,
          opacity: 0.9,
        }}
      />

      <View
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: theme.colors.secondary,
          bottom: 140,
          right: -120,
          opacity: 0.8,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: tokens.spacing.xl,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: tokens.radii.xl,
              backgroundColor: theme.colors.surface,
              padding: tokens.spacing.lg,
              gap: tokens.spacing.md,
              ...(Platform.OS === "web" && {
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.08,
                shadowRadius: 40,
              }),
            }}
          >
            <View
              style={{
                alignItems: "center",
                gap: tokens.spacing.xl,
              }}
            >
              <Image
                source={require("../assets/img/logo.png")}
                style={{
                  width: 140,
                  height: 140,
                  resizeMode: "contain",
                }}
              />

              <View
                style={{
                  alignItems: "center",
                  gap: tokens.spacing.xs,
                }}
              >
                <Text
                  variant="headlineMedium"
                  style={{
                    fontWeight: "800",
                    textAlign: "center",
                    letterSpacing: -0.5,
                  }}
                >
                  Sign In
                </Text>

                <Text
                  variant="bodyMedium"
                  style={{
                    textAlign: "center",
                    color: theme.colors.onSurfaceVariant,
                    lineHeight: 22,
                  }}
                >
                  Authenticate to access your FAITH workspace
                </Text>
              </View>
            </View>

            <View
              style={{
                gap: tokens.spacing.sm,
              }}
            >
              <TextInput
                label="Username"
                mode="outlined"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                outlineStyle={{
                  borderRadius: tokens.radii.lg,
                  borderColor: theme.colors.outline,
                }}
                style={{
                  backgroundColor: theme.colors.surface,
                }}
                left={
                  <TextInput.Icon
                    icon="account-outline"
                    color={theme.colors.primary}
                  />
                }
              />

              <TextInput
                ref={passwordRef}
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                outlineStyle={{
                  borderRadius: tokens.radii.lg,
                  borderColor: theme.colors.outline,
                }}
                style={{
                  backgroundColor: theme.colors.surface,
                }}
                left={
                  <TextInput.Icon
                    icon="lock-outline"
                    color={theme.colors.primary}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color={theme.colors.onSurfaceVariant}
                  />
                }
              />
            </View>

            <View
              style={{ marginTop: tokens.spacing.md, gap: tokens.spacing.xl }}
            >
              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={!username || !password || isSubmitting}
                contentStyle={{
                  height: 56,
                }}
                style={{
                  borderRadius: tokens.radii.lg,
                  elevation: 2,
                }}
                labelStyle={{
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Authenticate to FAITH
              </Button>

              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textAlign: "center",
                    lineHeight: 18,
                  }}
                >
                  Reach system admin if you need help signing in.
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: tokens.spacing.xl,
                paddingTop: tokens.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.surfaceVariant,
                alignItems: "center",
              }}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.outline, textAlign: "center" }}
              >
                This is dummy PWA version of FAITH. Username: user | Password:
                123 to continue.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  if (Platform.OS === "web") {
    return renderContent();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {renderContent()}
    </TouchableWithoutFeedback>
  );
}
