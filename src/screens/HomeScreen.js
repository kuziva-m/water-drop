import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  BackHandler,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { COLORS } from "../theme/colors";
import { useAuth } from "../lib/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { FONTS } from "../theme/typography"; // Import the new fonts

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // --- BACK BUTTON HANDLER ---
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!user) {
          navigation.navigate("Onboarding");
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [user, navigation])
  );

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredSuppliers =
    suppliers?.filter(
      (s) =>
        searchQuery === "" ||
        (s.locations &&
          s.locations.some((loc) =>
            loc.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const renderSupplier = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Detail", { supplier: item })}
      activeOpacity={0.9}
    >
      <View style={styles.cardInner}>
        {/* Left: Image or Placeholder Icon */}
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderContainer]}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={32}
              color={COLORS.accent}
            />
          </View>
        )}

        {/* Right: Content */}
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={COLORS.textSub}
              />
              <Text style={styles.cardSub} numberOfLines={1}>
                {item.locations ? item.locations[0] : "Harare"}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceTag}>
              <Text style={styles.priceLabel}>Base Price</Text>
              <Text style={styles.priceValue}>${item.base_price}</Text>
            </View>

            {/* Gold Action Button */}
            <View style={styles.bookBtn}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={COLORS.gold}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Floating Rating Badge */}
      <View style={styles.ratingBadge}>
        <MaterialCommunityIcons name="star" size={12} color="white" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* --- HERO HEADER --- */}
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome Back,</Text>
            <Text style={styles.username}>
              {user ? user.email.split("@")[0] : "Guest"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate(user ? "Profile" : "Auth")}
          >
            <MaterialCommunityIcons
              name="account"
              size={26}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={COLORS.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Find water in your area..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* --- LIST SECTION --- */}
      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Premium Suppliers</Text>
          <Text style={styles.resultCount}>
            {isLoading ? "..." : filteredSuppliers.length} found
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.accent}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlashList
            data={filteredSuppliers}
            renderItem={renderSupplier}
            estimatedItemSize={120}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    paddingHorizontal: 25,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  greeting: {
    fontSize: 18, // Increased from 16
    color: COLORS.gold,
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  username: {
    fontSize: 30,
    color: "white",
    fontFamily: FONTS.serif,
  },

  profileBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  // Search
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textMain,
    height: "100%",
    fontFamily: FONTS.regular,
  },

  // List
  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.textMain,
    fontFamily: FONTS.serif,
  },
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 14, // Increased from 12
    fontFamily: FONTS.regular,
  },

  // Cards
  card: {
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardInner: { flexDirection: "row", padding: 12 },

  // Image & Placeholder
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#F0F4F8",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E6DF",
  },

  cardContent: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  cardTitle: {
    fontSize: 18,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  cardSub: {
    color: COLORS.textSub,
    fontSize: 14, // Increased from 13
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 12, // Increased from 10
    color: COLORS.textMuted,
    textTransform: "uppercase",
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 22,
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },

  bookBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },

  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: "white",
    fontSize: 12,
    marginLeft: 4,
    fontFamily: FONTS.bold,
  },
});
