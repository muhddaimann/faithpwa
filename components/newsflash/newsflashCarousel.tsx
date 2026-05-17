import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useDesign } from "../../contexts/designContext";
import { newsflashes } from "../../constants/newsflash";
import NewsflashCard from "./newsflashCard";

const { width } = Dimensions.get("window");

const SIDE_PADDING = 24;
const SPACING = 16;

const CARD_WIDTH = width - 120;
const ITEM_SIZE = CARD_WIDTH + SPACING;

export default function NewsflashCarousel() {
  const { colors } = useTheme();
  const tokens = useDesign();

  const flatListRef = useRef<FlatList>(null);

  const baseData = newsflashes.slice(0, 3);

  const carouselData = [...baseData, ...baseData];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = activeIndex + 1;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * ITEM_SIZE,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE);

    setActiveIndex(index);

    if (index >= baseData.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });

        setActiveIndex(0);
      }, 200);
    }
  };

  return (
    <View
      style={{
        gap: tokens.spacing.md,
      }}
    >
      <FlatList
        ref={flatListRef}
        data={carouselData}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING,
          paddingRight: SIDE_PADDING + 32,
        }}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item, index }) => {
          const visibleIndex = index % baseData.length;

          const active = visibleIndex === activeIndex % baseData.length;

          return (
            <View
              style={{
                width: CARD_WIDTH,
                transform: [{ scale: active ? 1 : 0.94 }],
                opacity: active ? 1 : 0.6,
              }}
            >
              <NewsflashCard newsflash={item} />
            </View>
          );
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        {baseData.map((_, index) => {
          const active = index === activeIndex % baseData.length;

          return (
            <View
              key={index}
              style={{
                width: active ? 24 : 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: active
                  ? colors.primary
                  : colors.surfaceVariant,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
