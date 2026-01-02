import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function DetailScreen({ route, navigation }) {
  const { supplier } = route.params;
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(5000);

  const handleCall = () => {
    if (supplier.phone) Linking.openURL(`tel:${supplier.phone}`);
    else Alert.alert("No Phone", "This supplier hasn't listed a phone number.");
  };

  const handleOrder = () => {
    Alert.alert(
      "Coming Soon",
      "Order functionality will be available in the next update!"
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* --- HERO SECTION --- */}
        <View style={styles.imageContainer}>
          {supplier.image_url ? (
            <Image
              source={{ uri: supplier.image_url }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            // SNAZZY HERO FALLBACK
            <LinearGradient
              colors={[
                COLORS.primary || "#2C5282",
                COLORS.primaryDark || "#1A365D",
              ]}
              style={styles.placeholderImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name="water-pump"
                size={80}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.brandFallbackText}>{supplier.name}</Text>
            </LinearGradient>
          )}

          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* --- CONTENT --- */}
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <Text style={styles.title}>{supplier.name}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons
                name="star"
                size={16}
                color={COLORS.highlight}
              />
              <Text style={styles.ratingText}>
                {supplier.rating || "New"} •{" "}
                {supplier.locations ? supplier.locations[0] : "Harare"}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.statLabel}>
                ETA: {supplier.eta || "Same Day"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.statLabel}>${supplier.base_price}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>QUANTITY</Text>
          <View style={styles.quantityContainer}>
            {[2500, 5000, 10000].map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.qBtn, quantity === q && styles.qBtnActive]}
                onPress={() => setQuantity(q)}
              >
                <Text
                  style={[styles.qText, quantity === q && styles.qTextActive]}
                >
                  {q}L
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 25 },
        ]}
      >
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            ${(supplier.base_price * (quantity / 5000)).toFixed(0)}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <MaterialCommunityIcons
              name="phone"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
            <Text style={styles.orderText}>Order Water</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  imageContainer: { height: 300, width: "100%", position: "relative" },
  image: { width: "100%", height: "100%" },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  brandFallbackText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: FONTS.bold,
    marginTop: 10,
    fontSize: 18,
  },

  backBtn: {
    position: "absolute",
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  content: {
    padding: 25,
    marginTop: -30,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
  },
  headerBlock: { marginBottom: 25 },
  title: {
    fontSize: 26,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
    marginBottom: 5,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingText: {
    color: COLORS.textSub,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 1,
  },
  statItem: { alignItems: "center", flex: 1, gap: 5 },
  statLabel: { fontSize: 12, color: COLORS.textMain, fontFamily: FONTS.bold },
  divider: { width: 1, backgroundColor: COLORS.border, height: "80%" },

  sectionHeader: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 15,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },

  quantityContainer: { flexDirection: "row", gap: 15, marginBottom: 20 },
  qBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  qBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  qText: { fontSize: 14, color: COLORS.textSub, fontFamily: FONTS.bold },
  qTextActive: { color: "white" },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 25,
    paddingTop: 20, // Add more breathing room top
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    // Add shadow so it separates from content clearly
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  totalPrice: { fontSize: 24, color: COLORS.textMain, fontFamily: FONTS.bold },

  actionButtons: { flexDirection: "row", gap: 15 },
  callBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EBF8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  orderBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    justifyContent: "center",
  },
  orderText: { color: "white", fontFamily: FONTS.bold, fontSize: 16 },
});
