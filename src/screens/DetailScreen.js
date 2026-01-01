import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"; // <--- IMPORT MAP
import { supabase } from "../lib/supabase";
import { COLORS } from "../theme/colors";

const { width } = Dimensions.get("window");

export default function DetailScreen({ route, navigation }) {
  const { supplier } = route.params;
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [volume, setVolume] = useState(5000);
  const [waterType, setWaterType] = useState("Potable");
  const [slot, setSlot] = useState("Standard");

  // Default coordinate for Harare if supplier has no geo-data (Mock)
  const supplierLocation = {
    latitude: -17.824858,
    longitude: 31.053028,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const calculateTotal = () => {
    let multiplier = 1;
    if (volume === 5000) multiplier = 1.5;
    if (volume === 10000) multiplier = 2.5;

    let total = supplier.base_price * multiplier;
    if (waterType === "Construction") total -= 10;
    if (slot === "Express") total += 20;
    return Math.floor(total);
  };

  const totalPrice = calculateTotal();

  const orderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("orders").insert({
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        supplier_id: supplier.id,
        volume: volume,
        water_type: waterType,
        total_price: totalPrice,
        delivery_slot: slot,
        status: "PENDING",
      });

      if (error) throw error;
      return "Success";
    },
    onSuccess: () => {
      Alert.alert("Order Placed!", "The supplier has received your request.", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    },
    onError: (err) => Alert.alert("Error", err.message),
  });

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.textMain}
            />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Supplier Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.detailScroll}>
          <Image
            source={{ uri: supplier.image_url }}
            style={styles.detailImage}
            contentFit="cover"
          />

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{supplier.name}</Text>

            {/* --- NEW: LITE MAP INTEGRATION --- */}
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={supplierLocation}
                liteMode={true} // <--- THE SECRET WEAPON (0 RAM usage)
                scrollEnabled={false} // Makes it static
                zoomEnabled={false}
              >
                <Marker coordinate={supplierLocation} />
              </MapView>
              <View style={styles.mapOverlay}>
                <Text style={styles.mapText}>Tap to navigate</Text>
              </View>
            </View>
            {/* ---------------------------------- */}

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color={COLORS.accent}
              />
              <Text style={styles.infoSub}>
                {supplier.locations ? supplier.locations.join(", ") : "Harare"}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{supplier.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{supplier.eta}</Text>
                <Text style={styles.statLabel}>Est. Time</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${supplier.base_price}</Text>
                <Text style={styles.statLabel}>Base Cost</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionSection}>
            <Text style={styles.noteText}>
              Proceed to customize your delivery.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryBtnText}>Start Order Request</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={COLORS.surface}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // STEP 2 (Order Form) remains the same...
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.textMain}
          />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Configure Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.detailScroll}>
        {/* VOLUME SELECTOR */}
        <Text style={styles.fieldLabel}>Select Volume</Text>
        <View style={styles.optionGrid}>
          {[2500, 5000, 10000].map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.miniOption,
                volume === v && styles.miniOptionActive,
              ]}
              onPress={() => setVolume(v)}
            >
              <Text
                style={[
                  styles.miniOptionText,
                  volume === v && styles.activeText,
                ]}
              >
                {v}L
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TYPE SELECTOR */}
        <Text style={styles.fieldLabel}>Water Type</Text>
        <View style={styles.optionGrid}>
          {["Potable", "Construction"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.miniOption,
                waterType === t && styles.miniOptionActive,
              ]}
              onPress={() => setWaterType(t)}
            >
              <Text
                style={[
                  styles.miniOptionText,
                  waterType === t && styles.activeText,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Delivery Details</Text>
        <View style={styles.formGroup}>
          <TextInput
            style={styles.inputSimple}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.inputSimple}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.inputSimple}
            placeholder="Full Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.totalBlock}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.totalLabel}>Total Estimated Cost</Text>
            <Text style={styles.totalValue}>${totalPrice}</Text>
          </View>
          <Text style={styles.disclaimer}>Cash or USD upon delivery.</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            orderMutation.isPending && { opacity: 0.7 },
          ]}
          onPress={() => {
            if (!name || !phone || !address)
              Alert.alert("Missing Info", "Please fill in all details.");
            else orderMutation.mutate();
          }}
          disabled={orderMutation.isPending}
        >
          <Text style={styles.primaryBtnText}>
            {orderMutation.isPending ? "Sending..." : "Confirm Order"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  detailHeader: {
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: { padding: 5 },
  detailTitle: { fontSize: 16, fontWeight: "600", color: COLORS.textMain },
  detailScroll: { padding: 25 },
  detailImage: {
    width: "100%",
    height: 200,
    borderRadius: 25,
    marginBottom: 25,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 5,
  },

  // MAP STYLES
  mapContainer: {
    height: 120,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  map: { width: "100%", height: "100%" },
  mapOverlay: {
    position: "absolute",
    bottom: 5,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  mapText: { fontSize: 10, fontWeight: "bold", color: COLORS.textMain },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  infoSub: { marginLeft: 5, color: COLORS.textSub, fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  dividerVertical: {
    width: 1,
    height: "80%",
    backgroundColor: COLORS.background,
  },
  actionSection: { marginTop: 10 },
  noteText: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: "center",
    marginBottom: 15,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
  },
  primaryBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 10,
    marginTop: 10,
  },
  optionGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  miniOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  miniOptionActive: { borderColor: COLORS.accent, backgroundColor: "#E3F2FD" },
  miniOptionText: { fontWeight: "600", color: COLORS.textSub },
  activeText: { color: COLORS.accent },
  formGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  inputSimple: { paddingVertical: 15, fontSize: 16, color: COLORS.textMain },
  divider: { height: 1, backgroundColor: COLORS.background },
  totalBlock: { marginBottom: 20 },
  totalLabel: { fontSize: 16, color: COLORS.textMain, fontWeight: "600" },
  totalValue: { fontSize: 24, color: COLORS.accent, fontWeight: "800" },
  disclaimer: { fontSize: 12, color: COLORS.textMuted, marginTop: 5 },
});
