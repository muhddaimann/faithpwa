import { useEffect, useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text, useTheme, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';
import { useBroadcastStore } from '../contexts/api/broadcastStore';
import { useOverlay } from '../contexts/overlayContext';
import { newsflashPriorities } from '../constants/newsflash';
import { type Broadcast } from '../contexts/api/broadcast';

export const useNewsflash = (limit?: number) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { showSheet, hideSheet, toast } = useOverlay();
  const {
    broadcasts,
    loading,
    error,
    selectedBroadcast,
    fetchBroadcasts,
    setBroadcast,
    clearSelected,
  } = useBroadcastStore();

  // Fetch broadcasts on mount if list is empty
  useEffect(() => {
    if (broadcasts.length === 0 && !loading && !error) {
      fetchBroadcasts();
    }
  }, [broadcasts.length, loading, error, fetchBroadcasts]);

  const handleAcknowledge = async (id: number) => {
    // In a real app, you would call an API here
    // await acknowledgeBroadcast(id);
    toast({
      message: 'Announcement acknowledged',
      variant: 'success',
    });
    hideSheet();
  };

  const normalizePriority = (p?: string): keyof typeof newsflashPriorities => {
    if (!p) return "Normal";
    const normalized = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    if (normalized === "Critical" || normalized === "Important" || normalized === "Normal") {
      return normalized as keyof typeof newsflashPriorities;
    }
    return "Normal";
  };

  const showDetails = (item: Broadcast) => {
    const priorityKey = normalizePriority(item.BroadcastPriority);
    const priority = newsflashPriorities[priorityKey];

    showSheet({
      content: (
        <View key={`broadcast-detail-${item.broadcast_id}`} style={{ gap: 20, paddingBottom: 20 }}>
          <View
            key="detail-header"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                backgroundColor: priority.color + '15',
                padding: 12,
                borderRadius: 16,
              }}
            >
              <MaterialCommunityIcons
                name={priority.icon as any}
                size={32}
                color={priority.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: '800' }}>
                {item.NewsName}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.BroadcastType} • {item.BroadcastPriority} Priority
              </Text>
            </View>
          </View>

          <Divider key="detail-divider" />

          <View key="detail-content" style={{ gap: 8 }}>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}
            >
              MESSAGE
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.surfaceVariant + '40',
                padding: 16,
                borderRadius: 12,
              }}
            >
              <RenderHTML
                contentWidth={width - 64} // Accounting for modal padding
                source={{ html: item.Content }}
                tagsStyles={{
                  body: {
                    color: theme.colors.onSurface,
                    fontSize: 14,
                    lineHeight: 22,
                  },
                  p: {
                    marginBottom: 8,
                  },
                  img: {
                    borderRadius: 8,
                    marginTop: 8,
                  }
                }}
              />
            </View>
          </View>

          <View key="detail-footer" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ gap: 4 }}>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '700',
                }}
              >
                POSTED
              </Text>
              <Text variant="bodyMedium">
                {item.CreatedDateTime ? new Date(item.CreatedDateTime).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          <Button 
            key="detail-action"
            mode="contained" 
            onPress={() => handleAcknowledge(item.broadcast_id)}
            style={{ marginTop: 8, borderRadius: 12 }}
            contentStyle={{ height: 48 }}
          >
            ACKNOWLEDGE MEMO
          </Button>
        </View>
      ),
    });
  };

  // Handle optional limiting (e.g., limit 3 for home carousel)
  const displayedBroadcasts = useMemo(() => {
    if (limit && limit > 0) {
      return broadcasts.slice(0, limit);
    }
    return broadcasts;
  }, [broadcasts, limit]);

  return {
    broadcasts: displayedBroadcasts,
    allBroadcasts: broadcasts,
    loading,
    error,
    selectedBroadcast,
    refreshNews: fetchBroadcasts,
    selectNews: setBroadcast,
    closeNews: clearSelected,
    showDetails,
    hasNews: broadcasts.length > 0,
  };
};
