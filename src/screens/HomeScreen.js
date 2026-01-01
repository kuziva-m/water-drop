import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { COLORS } from "../theme/colors";
// 1. Import the Auth Context
import { useAuth } from "../lib/AuthContext";

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Get the current user status
  const { user } = useAuth();

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
      activeOpacity={0.8}
    >
      <View style={styles.cardRow}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.cardImage}
          contentFit="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.ratingTag}>
              <MaterialCommunityIcons
                name="star"
                size={12}
                color={COLORS.textMain}
              />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.cardSub} numberOfLines={1}>
            Servicing:{" "}
            {item.locations ? item.locations.join(", ") : "All Areas"}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaBadge}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={COLORS.textSub}
              />
              <Text style={styles.metaText}>{item.eta}</Text>
            </View>
            <Text style={styles.priceText}>from ${item.base_price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user ? "User" : "Guest"}</Text>
          <Text style={styles.headline}>Find water near you.</Text>
        </View>

        {/* 3. Updated Profile Icon Logic */}
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate(user ? "Profile" : "Auth")}
        >
          <MaterialCommunityIcons
            name="account"
            size={24}
            // Icon turns Blue (Accent) if logged in, White (Surface) if guest
            color={user ? COLORS.accent : COLORS.surface}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={COLORS.accent}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your suburb (e.g. Greendale)"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Suppliers</Text>
          <Text style={styles.resultCount}>
            {isLoading ? "Loading..." : `${filteredSuppliers.length} found`}
          </Text>
        </View>

        <FlashList
          data={filteredSuppliers}
          renderItem={renderSupplier}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="water-off"
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>
                {isLoading ? "Connecting..." : "No suppliers found."}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 14, color: COLORS.textMuted, fontWeight: "600" },
  headline: {
    fontSize: 28,
    color: COLORS.textMain,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.textMain,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: { paddingHorizontal: 25, marginBottom: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textMain,
    height: "100%",
  },
  listContainer: { flex: 1, paddingHorizontal: 25 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textMain },
  resultCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardRow: { flexDirection: "row" },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  cardContent: { flex: 1, marginLeft: 15, justifyContent: "center" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMain },
  ratingTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
    color: COLORS.textMain,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 4,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaBadge: { flexDirection: "row", alignItems: "center" },
  metaText: {
    fontSize: 12,
    color: COLORS.textSub,
    marginLeft: 4,
    fontWeight: "500",
  },
  priceText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { marginTop: 10, color: COLORS.textMuted, fontSize: 14 },
});
