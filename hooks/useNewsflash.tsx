import { useCallback, useEffect, useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';
import { useBroadcastStore } from '../contexts/api/broadcastStore';
import { useOverlay } from '../contexts/overlayContext';
import { newsflashPriorities } from '../constants/newsflash';
import { type Broadcast } from '../contexts/api/broadcast';
import AcknowledgeButton from '../components/newsflash/acknowledgeButton';
import { formatNewsDate } from '../helpers/newsflash';

export const useNewsflash = (limit?: number) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { showSheet, hideSheet, toast, showLoader, hideLoader } = useOverlay();
  const {
    broadcasts,
    loading,
    error,
    selectedBroadcast,
    fetchBroadcasts,
    setBroadcast,
    clearSelected,
    acknowledge,
  } = useBroadcastStore();

  // Fetch broadcasts on mount if list is empty
  useEffect(() => {
    if (broadcasts.length === 0 && !loading && !error) {
      fetchBroadcasts();
    }
  }, [broadcasts.length, loading, error, fetchBroadcasts]);

  const isAcknowledged = useCallback(
    (item: Broadcast) => item.Acknowledged === 1,
    [],
  );

  const handleAcknowledge = async (item: Broadcast) => {
    showLoader('Acknowledging...');
    const ok = await acknowledge(item.ID);
    hideLoader();
    if (ok) {
      hideSheet();
      toast({
        message: 'Announcement acknowledged',
        variant: 'success',
      });
    } else {
      toast({
        message: 'Could not acknowledge. Please try again.',
        variant: 'error',
      });
    }
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
        <View key={`broadcast-detail-${item.ID}`} style={{ gap: 20, paddingBottom: 20 }}>
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
                {formatNewsDate(item.CreatedDateTime, 'N/A')}
              </Text>
            </View>
          </View>

          <AcknowledgeButton
            key="detail-action"
            acknowledged={isAcknowledged(item)}
            onAcknowledge={() => handleAcknowledge(item)}
          />
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
    isAcknowledged,
    hasNews: broadcasts.length > 0,
  };
};
