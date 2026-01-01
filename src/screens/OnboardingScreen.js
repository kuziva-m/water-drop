import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Reliable Water,\nDelivered.",
    subtitle:
      "Stop calling disconnected numbers. Find verified bulk water suppliers in your area instantly.",
    icon: "water-pump",
    // ⚠️ Updated to .jpg
    image: require("../../assets/onboarding-1.jpg"),
  },
  {
    id: "2",
    title: "Upfront Pricing,\nNo Surprises.",
    subtitle:
      "Compare prices for 2500L, 5000L, and 10000L loads. Pay Cash or USD upon delivery.",
    icon: "cash-multiple",
    // ⚠️ Updated to .jpg
    image: require("../../assets/onboarding-2.jpg"),
  },
  {
    id: "3",
    title: "Track Your\nDelivery.",
    subtitle:
      "Know exactly when the truck will arrive. Manage your orders and re-order with one tap.",
    icon: "map-marker-path",
    // ⚠️ Updated to .jpeg
    image: require("../../assets/onboarding-3.jpeg"),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);

  const updateIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace("MainTabs"); // Finish onboarding -> Go to Home
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateIndex}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Background Image: Top 55% of screen */}
            <ImageBackground
              source={item.image}
              style={styles.image}
              resizeMode="cover" // Ensures it fills the space without stretching
            >
              <View style={styles.overlay} />
            </ImageBackground>

            {/* White Card Content: Bottom 45% */}
            <View style={styles.contentContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={40}
                  color={COLORS.accent}
                />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Footer Navigation (Dots & Button) */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={goNext}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <MaterialCommunityIcons
            name={currentIndex === SLIDES.length - 1 ? "check" : "arrow-right"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  slide: { width, height: height, alignItems: "center" },

  // Image takes up top ~55%
  image: { width, height: height * 0.55, justifyContent: "flex-end" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  // Card pulls up over the image
  contentContainer: {
    flex: 1,
    width: width,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 30,
    alignItems: "center",
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSub,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dots: { flexDirection: "row", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ddd" },
  activeDot: { backgroundColor: COLORS.accent, width: 25 },

  btn: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    gap: 10,
    elevation: 3,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
