import React, { useMemo, useState, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Modal, Portal, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../contexts/designContext";

type Variant = "single" | "range";
type ViewMode = "Weekly" | "Monthly";

type DatePickerContentProps = {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  value?: Date | null;
  onChange?: (date: Date) => void;
  rangeValue?: {
    start: Date | null;
    end: Date | null;
  };
  onRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  onConfirm?: () => void;
};

export function DatePickerContent({
  variant = "single",
  title = "Select Date",
  subtitle = "Choose your preferred date",
  value,
  onChange,
  rangeValue,
  onRangeChange,
  onConfirm,
}: DatePickerContentProps) {
  const theme = useTheme();
  const tokens = useDesign();
  const { spacing, radii, typography } = tokens;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState<ViewMode>("Weekly");
  const [hasChanged, setHasChanged] = useState(false);

  // Selection states
  const [tempSingle, setTempSingle] = useState<Date | null>(value || null);
  const [tempRange, setTempRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(rangeValue || { start: null, end: null });

  // Navigation states
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value || today;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(value || today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
  });

  const monthLabel = useMemo(() => {
    if (view === "Monthly") {
      return currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (currentWeekStart.getMonth() === weekEnd.getMonth()) {
        return currentWeekStart.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
      return `${currentWeekStart.toLocaleDateString("en-US", { month: "short" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    }
  }, [currentMonth, currentWeekStart, view]);

  const days = useMemo(() => {
    if (view === "Monthly") {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const totalDays = new Date(year, month + 1, 0).getDate();

      let startOffset = firstDay.getDay() - 1;
      if (startOffset < 0) startOffset = 6; // Monday start

      const result = [];
      for (let i = 0; i < startOffset; i++) result.push(null);
      for (let day = 1; day <= totalDays; day++) result.push(new Date(year, month, day));
      return result;
    } else {
      const result = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        result.push(d);
      }
      return result;
    }
  }, [currentMonth, currentWeekStart, view]);

  const isSameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const handleSelect = (date: Date) => {
    setHasChanged(true);
    if (variant === "single") {
      setTempSingle(date);
      return;
    }

    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: date, end: null });
      return;
    }

    if (date < tempRange.start) {
      setTempRange({ start: date, end: tempRange.start });
      return;
    }

    setTempRange({ start: tempRange.start, end: date });
  };

  const handleConfirm = () => {
    if (variant === "single" && tempSingle) onChange?.(tempSingle);
    if (variant === "range") onRangeChange?.(tempRange);
    onConfirm?.();
  };
  
  const navigate = (direction: number) => {
    if (view === "Monthly") {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    } else {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + direction * 7);
      setCurrentWeekStart(newWeekStart);
    }
  };

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  const confirmLabel = useMemo(() => {
    if (variant === "single") {
      return tempSingle
        ? tempSingle.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Select Date";
    }
    return tempRange.start && tempRange.end
      ? `${tempRange.start.getDate()} - ${tempRange.end.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })}`
      : "Select Range";
  }, [tempSingle, tempRange, variant]);

  return (
    <View style={{ gap: spacing.lg }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: "800", color: theme.colors.onSurface }}>
            {title}
          </Text>
          <Text style={{ fontSize: typography.sizes.xs, color: theme.colors.onSurfaceVariant, opacity: 0.7 }}>
            {subtitle}
          </Text>
        </View>

        {/* View Switcher */}
        <View style={{
          flexDirection: "row",
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: radii.full,
          padding: 3,
          gap: 2
        }}>
          {(["Weekly", "Monthly"] as ViewMode[]).map((m) => {
            const active = view === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setView(m)}
                style={{
                  minWidth: 36,
                  height: 32,
                  paddingHorizontal: active ? 12 : 0,
                  borderRadius: radii.full,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? theme.colors.primary : "transparent"
                }}
              >
                {active ? (
                  <Text style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: theme.colors.onPrimary
                  }}>
                    {m}
                  </Text>
                ) : (
                  <MaterialCommunityIcons
                    name={m === "Weekly" ? "view-week-outline" : "calendar-month-outline"}
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Navigation - Only show in Monthly view */}
      {view === "Monthly" && (
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.surfaceVariant + "40",
          padding: spacing.xs,
          borderRadius: radii.lg
        }}>
          <TouchableOpacity onPress={() => navigate(-1)} style={{ padding: spacing.xs }}>
            <MaterialCommunityIcons name="chevron-left" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
          
          <Text style={{ fontSize: typography.sizes.sm, fontWeight: "700", color: theme.colors.onSurface }}>
            {monthLabel}
          </Text>

          <TouchableOpacity onPress={() => navigate(1)} style={{ padding: spacing.xs }}>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      )}

      {/* Calendar Content */}
      <View style={{ gap: spacing.sm }}>
        {view === "Monthly" ? (
          <>
            {/* Week Day Labels */}
            <View style={{ flexDirection: "row", marginBottom: spacing.xs }}>
              {weekDays.map((day, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: theme.colors.onSurfaceVariant, opacity: 0.5 }}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Dates Grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: spacing.xs }}>
              {days.map((date, index) => {
                if (!date) return <View key={`empty-${index}`} style={{ width: "14.28%", aspectRatio: 1.2 }} />;

                const selected = variant === "single" 
                  ? isSameDay(tempSingle, date) 
                  : isSameDay(tempRange.start, date) || isSameDay(tempRange.end, date);
                
                const isToday = isSameDay(today, date);
                const inRange = variant === "range" && tempRange.start && tempRange.end && date > tempRange.start && date < tempRange.end;

                return (
                  <View key={date.toISOString()} style={{ width: "14.28%", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => handleSelect(date)}
                      activeOpacity={0.8}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: radii.md,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected 
                          ? theme.colors.primary 
                          : inRange 
                            ? theme.colors.primary + "20" 
                            : "transparent",
                        borderWidth: isToday ? 1.5 : 0,
                        borderColor: selected ? "rgba(255,255,255,0.4)" : theme.colors.primary,
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: selected || isToday ? "800" : "600",
                        color: selected ? theme.colors.onPrimary : theme.colors.onSurface
                      }}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          /* Weekly Vertical List */
          <View style={{ gap: spacing.xs }}>
            {days.map((date) => {
              if (!date) return null;
              const selected = variant === "single" 
                ? isSameDay(tempSingle, date) 
                : isSameDay(tempRange.start, date) || isSameDay(tempRange.end, date);
              const isToday = isSameDay(today, date);

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  onPress={() => handleSelect(date)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: spacing.sm,
                    borderRadius: radii.lg,
                    backgroundColor: selected 
                      ? theme.colors.primary 
                      : theme.colors.surfaceVariant + "40",
                    borderWidth: isToday && !selected ? 1.5 : 0,
                    borderColor: theme.colors.primary,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: selected || isToday ? "800" : "600",
                      color: selected ? theme.colors.onPrimary : theme.colors.onSurface,
                      width: 30
                    }}>
                      {date.getDate()}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: selected ? "700" : "500",
                      color: selected ? theme.colors.onPrimary : theme.colors.onSurface,
                    }}>
                      {date.toLocaleDateString("en-US", { weekday: "long" })}
                    </Text>
                  </View>
                  {selected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.onPrimary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Confirmation Button */}
      <TouchableOpacity
        onPress={handleConfirm}
        disabled={!hasChanged}
        activeOpacity={0.8}
        style={{
          height: 48,
          borderRadius: radii.lg,
          backgroundColor: hasChanged ? theme.colors.primary : theme.colors.surfaceVariant,
          alignItems: "center",
          justifyContent: "center",
          opacity: hasChanged ? 1 : 0.6
        }}
      >
        <Text style={{
          fontSize: 14,
          fontWeight: "800",
          color: hasChanged ? theme.colors.onPrimary : theme.colors.onSurfaceVariant
        }}>
          {confirmLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type Props = {
  visible: boolean;
  onDismiss: () => void;
  variant?: Variant;
  title?: string;
  subtitle?: string;
  value?: Date | null;
  onChange?: (date: Date) => void;
  rangeValue?: {
    start: Date | null;
    end: Date | null;
  };
  onRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
};

export default function DatePicker({
  visible,
  onDismiss,
  variant = "single",
  title,
  subtitle,
  value,
  onChange,
  rangeValue,
  onRangeChange,
}: Props) {
  const theme = useTheme();
  const tokens = useDesign();
  const { spacing, radii } = tokens;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          margin: spacing.lg,
          borderRadius: radii["2xl"],
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
        }}
      >
        <View style={{ padding: spacing.lg }}>
          <DatePickerContent
            variant={variant}
            title={title}
            subtitle={subtitle}
            value={value}
            onChange={onChange}
            rangeValue={rangeValue}
            onRangeChange={onRangeChange}
            onConfirm={onDismiss}
          />
        </View>
      </Modal>
    </Portal>
  );
}
