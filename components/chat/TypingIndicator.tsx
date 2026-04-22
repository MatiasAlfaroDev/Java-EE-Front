import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface Props {
  nombres: string[];
}

export function TypingIndicator({ nombres }: Props) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 150),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  const label = nombres.length === 1
    ? `${nombres[0]} está escribiendo`
    : `${nombres.slice(0, 2).join(' y ')} están escribiendo`;

  return (
    <View style={s.wrap}>
      <View style={s.dotsRow}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[s.dot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]} />
        ))}
      </View>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  dotsRow: { flexDirection: 'row', gap: 4 },
  dot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent },
  label:   { ...typography.caption, color: theme.textMuted },
});
