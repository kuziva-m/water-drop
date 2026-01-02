import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Animated,
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
import { FONTS } from "../theme/typography";

// Import Skeleton
import SkeletonCard from "../components/SkeletonCard";

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // --- HARDWARE BACK BUTTON HANDLER ---
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

  const {
    data: suppliers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      // Simulate network delay to show off the skeleton (remove in production)
      // await new Promise(resolve => setTimeout(resolve, 1500));
      const { data, error } = await supabase.from("suppliers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  // --- ANIMATED CARD ITEM ---
  const AnimatedCard = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100, // Stagger effect
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true, // Smoother on mobile
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Detail", { supplier: item })}
          activeOpacity={0.9}
        >
          <View style={styles.cardInner}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <LinearGradient
                colors={[
                  COLORS.primaryLight || "#4299E1",
                  COLORS.primary || "#2C5282",
                ]}
                style={styles.cardImage}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={32}
                  color="white"
                  style={{ opacity: 0.9 }}
                />
                <MaterialCommunityIcons
                  name="water"
                  size={60}
                  color="rgba(255,255,255,0.1)"
                  style={{ position: "absolute", bottom: -10, right: -10 }}
                />
              </LinearGradient>
            )}

            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons
                    name="map-marker-radius-outline"
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
                  <Text style={styles.priceLabel}>From</Text>
                  <Text style={styles.priceValue}>${item.base_price}</Text>
                </View>
                <View style={styles.bookBtn}>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="white"
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* HEADER */}
      <LinearGradient
        colors={[COLORS.primary || "#2C5282", COLORS.primaryLight || "#4299E1"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Mhoro / Hello,</Text>
            <Text style={styles.username}>
              {user ? user.email.split("@")[0] : "Guest"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={refreshing || isLoading}
          >
            <MaterialCommunityIcons
              name={refreshing ? "loading" : "refresh"}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={COLORS.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search suppliers..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verified Suppliers</Text>
          <Text style={styles.resultCount}>
            {isLoading ? "Checking..." : `${filteredSuppliers.length} found`}
          </Text>
        </View>

        {isLoading && !refreshing ? (
          // --- SHOW SKELETONS ---
          <View>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlashList
            data={filteredSuppliers}
            renderItem={({ item, index }) => (
              <AnimatedCard item={item} index={index} />
            )}
            estimatedItemSize={120}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#E2E8F0",
    marginBottom: 4,
    fontFamily: FONTS.regular,
  },
  username: { fontSize: 28, color: "white", fontFamily: FONTS.bold },

  refreshBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textMain,
    height: "100%",
    fontFamily: FONTS.regular,
  },

  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
  },
  resultCount: {
    color: COLORS.textSub,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },

  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  cardInner: { flexDirection: "row", padding: 12 },

  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cardContent: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  cardTitle: { fontSize: 17, color: COLORS.textMain, fontFamily: FONTS.bold },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardSub: {
    color: COLORS.textSub,
    fontSize: 13,
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  priceValue: { fontSize: 20, color: COLORS.primary, fontFamily: FONTS.bold },
  bookBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});
