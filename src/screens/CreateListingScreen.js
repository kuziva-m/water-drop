import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";
import { useAuth } from "../lib/AuthContext";

export default function CreateListingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    base_price: "",
    eta: "",
    phone: "",
    locations: "", // We'll convert this string to an array later
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit() {
    // 1. Validation
    if (!form.name || !form.base_price || !form.phone || !form.eta) {
      return Alert.alert("Missing Info", "Please fill in all required fields.");
    }

    setLoading(true);

    try {
      // 2. Prepare Data
      // Convert "Greendale, Borrowdale" -> ["Greendale", "Borrowdale"]
      const locationArray = form.locations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0);

      const priceNumber = parseFloat(form.base_price);

      // 3. Insert into Supabase
      const { error } = await supabase.from("suppliers").insert({
        name: form.name,
        base_price: priceNumber,
        eta: form.eta,
        phone: form.phone,
        locations: locationArray.length > 0 ? locationArray : ["Harare"], // Default if empty
        rating: 5.0, // New listings start with 5 stars!
        rating_count: 0,
        // We will leave image_url null for now (Home Screen handles placeholders)
        // If you added an 'owner_id' column to suppliers, uncomment below:
        // owner_id: user.id
      });

      if (error) throw error;

      // 4. Success
      Alert.alert("Success", "Your listing is live!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Listing</Text>
        <View style={{ width: 40 }} /> {/* Spacer to center title */}
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introBox}>
            <MaterialCommunityIcons
              name="rocket-launch-outline"
              size={32}
              color={COLORS.accent}
            />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.introTitle}>Grow your business</Text>
              <Text style={styles.introText}>
                List your water delivery service to reach thousands of buyers in
                your area instantly.
              </Text>
            </View>
          </View>

          {/* --- FORM SECTION --- */}
          <View style={styles.formCard}>
            {/* Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Aqua Flow Deliveries"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.name}
                  onChangeText={(t) => handleChange("name", t)}
                />
              </View>
            </View>

            {/* Price & ETA Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Base Price ($)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="40"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={form.base_price}
                    onChangeText={(t) => handleChange("base_price", t)}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Est. Time (ETA)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color={COLORS.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2 hrs"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.eta}
                    onChangeText={(t) => handleChange("eta", t)}
                  />
                </View>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="+263 77..."
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(t) => handleChange("phone", t)}
                />
              </View>
            </View>

            {/* Locations */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Areas</Text>
              <Text style={styles.helperText}>
                Separate multiple areas with commas
              </Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="map-marker-multiple-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Greendale, Msasa, Highlands"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.locations}
                  onChangeText={(t) => handleChange("locations", t)}
                />
              </View>
            </View>
          </View>

          {/* --- SUBMIT BUTTON --- */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.gold, "#B8860B"]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.btnText}>Publish Listing</Text>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color="white"
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    color: "white",
    fontFamily: FONTS.serif,
  },

  scrollContent: { padding: 20, paddingBottom: 50 },

  // Intro
  introBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  introTitle: {
    fontSize: 16,
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    color: COLORS.textSub,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },

  // Form
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    marginBottom: 8,
    marginTop: -4,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border || "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  prefix: {
    fontSize: 16,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMain,
  },

  // Button
  submitBtn: { borderRadius: 16, overflow: "hidden", elevation: 4 },
  btnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 10,
  },
  btnText: { color: "white", fontSize: 16, fontFamily: FONTS.bold },
});
