import React from "react";
import { View } from "react-native";
import { Text, useTheme, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../contexts/designContext";

type DocumentModalProps = {
  title?: string;
  refNo: string;
  onRefNoChange: (ref: string) => void;
  attachedFile: { name: string; type: string };
  onPick: () => Promise<void>;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DocumentModal({
  title = "Document Reference",
  refNo,
  onRefNoChange,
  attachedFile,
  onPick,
  onConfirm,
  onCancel,
}: DocumentModalProps) {
  const { colors } = useTheme();
  const tokens = useDesign();

  return (
    <View style={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing.md }}>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Text variant="titleMedium" style={{ fontWeight: "700" }}>
          {title}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: colors.onSurfaceVariant, textAlign: "center" }}
        >
          Enter the reference number for the selected document
        </Text>
      </View>

      <View style={{ gap: tokens.spacing.md }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          borderRadius: tokens.radii.lg,
          backgroundColor: colors.primaryContainer + '40',
          borderWidth: 1,
          borderColor: colors.primary + '20'
        }}>
          <MaterialCommunityIcons 
            name={attachedFile.type.includes('pdf') ? 'file-pdf-box' : 'image'} 
            size={24} 
            color={colors.primary} 
          />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '600' }}>
              {attachedFile.name}
            </Text>
          </View>
          <Button mode="text" onPress={onPick} compact textColor={colors.primary}>
            Change
          </Button>
        </View>

        <TextInput
          mode="outlined"
          label="Reference Number"
          placeholder="e.g. MC123456"
          value={refNo}
          onChangeText={onRefNoChange}
          autoFocus
          outlineStyle={{ borderRadius: tokens.radii.lg }}
          left={<TextInput.Icon icon="pound" />}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: tokens.spacing.md, marginTop: tokens.spacing.sm }}>
        <Button 
          mode="outlined" 
          onPress={onCancel} 
          style={{ flex: 1, borderRadius: tokens.radii.pill }}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={onConfirm} 
          disabled={!refNo.trim()}
          style={{ flex: 1, borderRadius: tokens.radii.pill }}
        >
          Confirm
        </Button>
      </View>
    </View>
  );
}
