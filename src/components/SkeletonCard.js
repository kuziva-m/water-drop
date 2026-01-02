import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { COLORS } from "../theme/colors";

const { width } = Dimensions.get("window");

export default function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Infinite Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.cardInner, { opacity }]}>
        {/* Fake Image */}
        <View style={styles.imagePlaceholder} />

        {/* Fake Text Lines */}
        <View style={styles.content}>
          <View style={styles.titleLine} />
          <View style={styles.subLine} />
          <View style={styles.footerLine} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: "hidden",
  },
  cardInner: { flexDirection: "row", padding: 12 },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  content: { flex: 1, marginLeft: 15, justifyContent: "center", gap: 10 },
  titleLine: {
    width: "80%",
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  subLine: {
    width: "50%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EDF2F7",
  },
  footerLine: {
    width: "100%",
    height: 20,
    borderRadius: 6,
    backgroundColor: "#F7FAFC",
    marginTop: 10,
  },
});
