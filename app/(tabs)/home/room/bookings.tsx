import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text, useTheme, SegmentedButtons, Card, Chip, IconButton, Divider} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDesign } from '../../../../contexts/designContext';
import { useRoom } from '../../../../hooks/useRoom';
import Header from '../../../../components/header';
import NoData from '../../../../components/noData';
import ScrollTop from '../../../../components/scrollTop';

export default function Bookings() {
  const theme = useTheme();
  const tokens = useDesign();
  const { myBookings, loading, refreshBookings, showBookingDetails } = useRoom();
  const [filter, setFilter] = useState('Upcoming');
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const filteredBookings = useMemo(() => {
    return myBookings.filter(b => b.Tag === filter);
  }, [myBookings, filter]);

  const onRefresh = useCallback(() => {
    refreshBookings();
  }, [refreshBookings]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offset > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const getStatusColor = (tag: string) => {
    switch (tag) {
      case 'Upcoming': return '#3B82F6';
      case 'Past': return '#10B981';
      case 'Cancelled': return '#EF4444';
      default: return theme.colors.outline;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ 
          paddingHorizontal: tokens.spacing.lg,
          paddingBottom: tokens.spacing["3xl"],
          gap: tokens.spacing.md 
        }}
        refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <Header 
          title="My Reservations" 
          subtitle="View and manage your room bookings" 
          showBack 
        />

        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'Upcoming', label: 'Active', icon: 'calendar-clock' },
            { value: 'Past', label: 'History', icon: 'history' },
            { value: 'Cancelled', label: 'Void', icon: 'close-circle-outline' },
          ]}
          style={{ marginBottom: tokens.spacing.sm }}
        />

        {filteredBookings.length === 0 ? (
          <View style={{ marginTop: 40 }}>
            <NoData 
              title={`No ${filter} Bookings`} 
              description={
                  filter === 'Upcoming' 
                  ? "You don't have any active room reservations at the moment."
                  : `You don't have any ${filter.toLowerCase()} bookings in your history.`
              }
              icon={filter === 'Upcoming' ? 'calendar-blank' : 'history'}
            />
          </View>
        ) : (
          <View style={{ gap: tokens.spacing.md }}>
            {filteredBookings.map((booking) => (
              <Card 
                key={booking.booking_id}
                mode="contained"
                style={{ 
                    borderRadius: tokens.radii.xl,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.outlineVariant
                }}
                onPress={() => showBookingDetails(booking)}
              >
                <Card.Content style={{ padding: tokens.spacing.md, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="titleMedium" style={{ fontWeight: '800' }}>{booking.Room_Name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                            {booking.Booking_Num}
                        </Text>
                    </View>
                    <Chip 
                        compact 
                        textStyle={{ fontSize: 10, fontWeight: '800', color: '#FFF' }}
                        style={{ backgroundColor: getStatusColor(booking.Tag) }}
                    >
                        {booking.Tag.toUpperCase()}
                    </Chip>
                  </View>

                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="calendar-range" size={16} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                            {new Date(booking.Start_Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                            {new Date(booking.Start_Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.End_Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                            {booking.Tower} • {booking.Level}
                        </Text>
                    </View>
                  </View>

                  <Divider />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}>PURPOSE</Text>
                        <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '600' }}>{booking.Event_Name}</Text>
                    </View>
                    <IconButton 
                        icon="chevron-right" 
                        size={20} 
                        onPress={() => showBookingDetails(booking)} 
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
      <ScrollTop visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}
