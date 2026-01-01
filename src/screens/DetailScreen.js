import React, { useState } from "react";
import { FONTS } from "../theme/typography";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function DetailScreen({ route, navigation }) {
  const { supplier } = route.params;
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(5000); // Default 5000L

  const handleCall = () => {
    if (supplier.phone) Linking.openURL(`tel:${supplier.phone}`);
    else Alert.alert("No Phone", "This supplier hasn't listed a phone number.");
  };

  const handleOrder = () => {
    const total = (supplier.base_price * (quantity / 2500)).toFixed(2); // Mock calc
    Alert.alert("Place Order", `Order ${quantity}L for $${total}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm Order",
        onPress: () => Alert.alert("Success", "Order sent to supplier!"),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HERO IMAGE --- */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: supplier.image_url }}
            style={styles.image}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageOverlay}
          />

          {/* Header Buttons */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{supplier.name}</Text>
            <View style={styles.ratingTag}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={COLORS.gold}
              />
              <Text style={styles.ratingText}>
                {supplier.rating} ({supplier.rating_count || 12} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* --- CONTENT --- */}
        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="water"
                size={24}
                color={COLORS.accent}
              />
              <Text style={styles.statLabel}>Capacity</Text>
              <Text style={styles.statValue}>20,000L</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="truck-fast"
                size={24}
                color={COLORS.accent}
              />
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>{supplier.eta || "2 hrs"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={COLORS.accent}
              />
              <Text style={styles.statLabel}>Base Price</Text>
              <Text style={styles.statValue}>${supplier.base_price}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>ABOUT SUPPLIER</Text>
          <Text style={styles.description}>
            Reliable bulk water delivery servicing{" "}
            {supplier.locations ? supplier.locations.join(", ") : "Harare"}. We
            accept Cash, USD, and Zipit. Same-day delivery guaranteed for orders
            before 2PM.
          </Text>

          {/* Quantity Selector */}
          <Text style={styles.sectionHeader}>SELECT QUANTITY</Text>
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

      {/* --- FOOTER --- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            ${(supplier.base_price * (quantity / 2500)).toFixed(0)}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <MaterialCommunityIcons
              name="phone"
              size={24}
              color={COLORS.accent}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
            <Text style={styles.orderText}>Book Now</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  imageContainer: { height: 350, width: "100%", position: "relative" },
  image: { width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: "absolute",
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  titleContainer: { position: "absolute", bottom: 30, left: 20, right: 20 },
  title: {
    fontSize: 32,
    color: "white",
    marginBottom: 8,
    fontFamily: FONTS.serif,
  }, // Playfair Display
  description: {
    fontSize: 16,
    color: COLORS.textSub,
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: FONTS.regular,
  },
  totalPrice: { fontSize: 28, color: COLORS.textMain, fontFamily: FONTS.serif }, // Playfair for the price looks expensive!
  ratingTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { color: COLORS.gold, fontWeight: "bold", marginLeft: 5 },

  content: {
    padding: 25,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: "bold",
    marginTop: 2,
  },
  divider: { width: 1, backgroundColor: "#eee", height: "80%" },

  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textMuted,
    marginBottom: 15,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSub,
    lineHeight: 24,
    marginBottom: 30,
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
  qBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  qText: { fontSize: 16, fontWeight: "600", color: COLORS.textSub },
  qTextActive: { color: "white", fontWeight: "bold" },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 25,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: { fontSize: 12, color: COLORS.textMuted },
  totalPrice: { fontSize: 28, fontWeight: "bold", color: COLORS.textMain },

  actionButtons: { flexDirection: "row", gap: 15 },
  callBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  orderBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
