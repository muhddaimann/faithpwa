import React, { useState, useEffect } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Text, useTheme, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../contexts/designContext";
import { Clinic, searchClinics } from "../contexts/api/clinic";

type ClinicModalProps = {
  selected?: Clinic | null;
  onSelect: (item: Clinic) => void;
};

export default function ClinicModal({
  selected,
  onSelect,
}: ClinicModalProps) {
  const { colors } = useTheme();
  const tokens = useDesign();
  const [query, setQuery] = useState("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const results = await searchClinics(query);
          setClinics(results);
        } catch (error) {
          console.error("Clinic search failed:", error);
        } finally {
          setLoading(false);
        }
      } else if (query.trim().length === 0) {
        setClinics([]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <View style={{ gap: tokens.spacing.md, maxHeight: 400 }}>
      <View style={{ alignItems: "center" }}>
        <Text variant="titleMedium" style={{ fontWeight: "700" }}>
          Select Clinic
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          Search for the clinic where you received treatment
        </Text>
      </View>

      <TextInput
        mode="outlined"
        placeholder="Search clinic name..."
        value={query}
        onChangeText={setQuery}
        left={<TextInput.Icon icon="magnify" />}
        outlineStyle={{ borderRadius: tokens.radii.lg }}
      />

      <ScrollView 
        style={{ marginTop: tokens.spacing.sm }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: tokens.spacing.sm, paddingBottom: tokens.spacing.md }}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
          ) : clinics.length > 0 ? (
            clinics.map((item) => {
              const isSelected = selected?.clinic_id === item.clinic_id;
              return (
                <Pressable
                  key={item.clinic_id}
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: tokens.spacing.md,
                    padding: tokens.spacing.md,
                    borderRadius: tokens.radii.lg,
                    backgroundColor: isSelected
                      ? colors.primaryContainer
                      : colors.surfaceVariant + "40",
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="hospital-building"
                      size={20}
                      color={isSelected ? colors.onPrimary : colors.onSurfaceVariant}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant="labelLarge" style={{ fontWeight: "700" }}>
                      {item.clinic_name}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                      {item.area}, {item.state}
                    </Text>
                  </View>

                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            })
          ) : query.length >= 2 ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                No clinics found matching "{query}"
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                Type at least 2 characters to search
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
