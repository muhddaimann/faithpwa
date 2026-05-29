import React, { useEffect, useState, useMemo } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Card, TextInput, useTheme, ActivityIndicator } from "react-native-paper";
import Header from "../../../components/header";
import { useDesign } from "../../../contexts/designContext";
import { useTabs } from "../../../contexts/tabContext";
import { useStaff } from "../../../hooks/useStaff";

export default function Update() {
  const theme = useTheme();
  const tokens = useDesign();
  const { setHideTabBar } = useTabs();
  const { staff, updateStaff, loading } = useStaff();

  const [form, setForm] = useState({
    nick_name: "",
    email: "",
    contact_no: "",
    address1: "",
    address2: "",
    address3: "",
  });

  useEffect(() => {
    if (staff) {
      setForm({
        nick_name: staff.nick_name || "",
        email: staff.email || "",
        contact_no: staff.contact_no || "",
        address1: staff.address1 || "",
        address2: staff.address2 || "",
        address3: staff.address3 || ""
      });
    }
  }, [staff]);

  const hasChanges = useMemo(() => {
    if (!staff) return false;
    return (
      form.nick_name !== (staff.nick_name || "") ||
      form.email !== (staff.email || "") ||
      form.contact_no !== (staff.contact_no || "") ||
      form.address1 !== (staff.address1 || "") ||
      form.address2 !== (staff.address2 || "") ||
      form.address3 !== (staff.address3 || "")
    );
  }, [form, staff]);

  useEffect(() => {
    setHideTabBar(true);
    return () => setHideTabBar(false);
  }, []);

  const handleSave = () => {
    updateStaff(form);
  };

  if (loading && !staff) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: tokens.spacing.lg,
            paddingBottom: tokens.spacing["3xl"],
            gap: tokens.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Update Profile"
            subtitle="Manage your personal information"
            showBack
          />

          <Card
            mode="contained"
            style={{
              borderRadius: tokens.radii.xl,
              backgroundColor: theme.colors.surface,
            }}
          >
            <View
              style={{
                padding: tokens.spacing.lg,
                gap: tokens.spacing.md,
              }}
            >
              <View style={{ gap: tokens.spacing.lg }}>
                <View style={{ gap: tokens.spacing.md }}>
                  <TextInput
                    mode="outlined"
                    label="Nickname"
                    value={form.nick_name}
                    onChangeText={(val) => setForm({ ...form, nick_name: val })}
                    outlineStyle={{
                      borderRadius: tokens.radii.lg,
                    }}
                  />

                  <TextInput
                    mode="outlined"
                    label="Email Address"
                    value={form.email}
                    onChangeText={(val) => setForm({ ...form, email: val })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    outlineStyle={{
                      borderRadius: tokens.radii.lg,
                    }}
                  />

                  <TextInput
                    mode="outlined"
                    label="Contact Number"
                    value={form.contact_no}
                    onChangeText={(val) => setForm({ ...form, contact_no: val })}
                    keyboardType="phone-pad"
                    outlineStyle={{
                      borderRadius: tokens.radii.lg,
                    }}
                  />
                  <View style={{ gap: tokens.spacing.md }}>
                    <TextInput
                      mode="outlined"
                      label="Address Line 1"
                      value={form.address1}
                      onChangeText={(val) => setForm({ ...form, address1: val })}
                      outlineStyle={{
                        borderRadius: tokens.radii.lg,
                      }}
                    />

                    <TextInput
                      mode="outlined"
                      label="Address Line 2"
                      value={form.address2}
                      onChangeText={(val) => setForm({ ...form, address2: val })}
                      outlineStyle={{
                        borderRadius: tokens.radii.lg,
                      }}
                    />

                    <TextInput
                      mode="outlined"
                      label="Address Line 3"
                      value={form.address3}
                      onChangeText={(val) => setForm({ ...form, address3: val })}
                      outlineStyle={{
                        borderRadius: tokens.radii.lg,
                      }}
                    />
                  </View>
                </View>
              </View>

              <Button
                mode="contained"
                disabled={!hasChanges}
                onPress={handleSave}
                style={{
                  borderRadius: tokens.radii.full,
                }}
                contentStyle={{
                  height: 52,
                }}
              >
                Save Changes
              </Button>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
