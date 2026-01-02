import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";
import { useAuth } from "../lib/AuthContext";

export default function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [user])
  );

  async function fetchListings() {
    try {
      setLoading(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .single();

      if (!profile?.phone_number) {
        setListings([]);
        return;
      }

      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("phone", profile.phone_number);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.log("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- UPDATED DELETE LOGIC ---
  async function handleDelete(id) {
    Alert.alert("Delete Listing", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Find the listing in our local state to get the image URL
            const listingToDelete = listings.find((l) => l.id === id);

            // 2. Delete Image from Storage Bucket (if it exists)
            if (listingToDelete?.image_url) {
              const fileName = listingToDelete.image_url.split("/").pop();

              // Safety: Ensure we only delete files created by this user
              if (fileName && fileName.startsWith(user.id)) {
                console.log("Deleting image:", fileName);
                const { error: storageError } = await supabase.storage
                  .from("suppliers")
                  .remove([fileName]);

                if (storageError)
                  console.log("Storage delete error:", storageError);
              }
            }

            // 3. Delete Record from Database
            const { error } = await supabase
              .from("suppliers")
              .delete()
              .eq("id", id);

            if (error) throw error;

            // 4. Refresh List
            fetchListings();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("CreateListing", { listing: item })}
    >
      <View style={styles.cardRow}>
        {/* Image */}
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <MaterialCommunityIcons name="water" size={24} color="white" />
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.sub}>
            {item.locations?.[0] || "Harare"} • ${item.base_price}
          </Text>
          <View style={styles.editBadge}>
            <MaterialCommunityIcons
              name="pencil"
              size={12}
              color={COLORS.primary}
            />
            <Text style={styles.editText}>Edit</Text>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color={COLORS.error}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 50 }}
          />
        ) : listings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="store-off-outline"
              size={60}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>No listings found.</Text>
            <Text style={styles.emptySub}>
              Tap the + button to create your first water listing.
            </Text>
          </View>
        ) : (
          <FlatList
            data={listings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Action Button - Lifted Up */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 30 + insets.bottom }]}
        onPress={() => navigation.navigate("CreateListing", { listing: null })}
      >
        <MaterialCommunityIcons name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 20, color: "white", fontFamily: FONTS.bold },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: { flex: 1, padding: 20 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },
  placeholder: { justifyContent: "center", alignItems: "center" },
  info: { flex: 1, marginLeft: 15 },
  title: { fontSize: 16, color: COLORS.textMain, fontFamily: FONTS.bold },
  sub: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
  },
  editText: { color: COLORS.primary, fontSize: 10, fontFamily: FONTS.bold },
  deleteBtn: { padding: 10 },

  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
    marginTop: 15,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 40,
  },

  fab: {
    position: "absolute",
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
