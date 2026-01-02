import React, { useState, useEffect } from "react";
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
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "../lib/supabase";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";
import { useAuth } from "../lib/AuthContext";

export default function CreateListingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const editingListing = route.params?.listing || null;
  const isEditMode = !!editingListing;

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    name: "",
    base_price: "",
    eta: "",
    phone: "",
    locations: "",
  });

  useEffect(() => {
    if (editingListing) {
      setForm({
        name: editingListing.name,
        base_price: String(editingListing.base_price),
        eta: editingListing.eta || "",
        phone: editingListing.phone || "",
        locations: editingListing.locations
          ? editingListing.locations.join(", ")
          : "",
      });
      if (editingListing.image_url) {
        setImage({ uri: editingListing.image_url });
      }
    }
  }, [editingListing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function pickImage() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted")
        return Alert.alert("Permission Needed", "Please allow photo access.");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  // --- HELPER: DELETE OLD IMAGE FROM BUCKET ---
  async function deleteOldImage(url) {
    try {
      if (!url) return;

      // Extract filename from URL (everything after the last /)
      const fileName = url.split("/").pop();

      // Safety: Only delete if it starts with the user's ID (prevents deleting others' files)
      if (!fileName.startsWith(user.id)) return;

      const { error } = await supabase.storage
        .from("suppliers")
        .remove([fileName]);

      if (error) {
        console.log("Failed to delete old image:", error.message);
      } else {
        console.log("Old image deleted:", fileName);
      }
    } catch (err) {
      console.log("Delete error:", err);
    }
  }

  async function handleSubmit() {
    if (!form.name || !form.base_price || !form.phone || !form.eta) {
      return Alert.alert("Missing Info", "Please fill in all required fields.");
    }

    setLoading(true);

    try {
      let finalImageUrl = editingListing?.image_url || null;

      // --- IMAGE UPLOAD & SWAP LOGIC ---
      // We only upload if the user picked a NEW image (it won't start with http)
      if (image && !image.uri.startsWith("http")) {
        console.log("Uploading new image...");

        // 1. Delete the old image first (if in Edit Mode)
        if (isEditMode && editingListing.image_url) {
          await deleteOldImage(editingListing.image_url);
        }

        // 2. Prepare new file
        const fileExt = image.uri.split(".").pop();
        // Add random math to ensure filename is totally unique (busts cache)
        const fileName = `${user.id}-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}.${fileExt}`;
        const formData = new FormData();

        formData.append("file", {
          uri: image.uri,
          name: fileName,
          type: image.mimeType || "image/jpeg",
        });

        // 3. Upload
        const { error: uploadError } = await supabase.storage
          .from("suppliers")
          .upload(fileName, formData, { upsert: true });

        if (uploadError) throw uploadError;

        // 4. Get New URL
        const { data: urlData } = supabase.storage
          .from("suppliers")
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
      }

      // --- PREPARE DB PAYLOAD ---
      const locationArray = form.locations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0);

      const priceNumber = parseFloat(form.base_price);

      const payload = {
        name: form.name,
        base_price: priceNumber,
        eta: form.eta,
        phone: form.phone,
        locations: locationArray.length > 0 ? locationArray : ["Harare"],
        rating: 5.0,
        image_url: finalImageUrl,
        owner_id: user.id
      };

      // --- UPDATE DATABASE ---
      let error;
      if (isEditMode) {
        const response = await supabase
          .from("suppliers")
          .update(payload)
          .eq("id", editingListing.id);
        error = response.error;
      } else {
        const response = await supabase.from("suppliers").insert(payload);
        error = response.error;
      }

      if (error) throw error;

      Alert.alert(
        "Success",
        isEditMode ? "Listing updated!" : "Listing live!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>
          {isEditMode ? "Edit Listing" : "New Listing"}
        </Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.previewImage}
                contentFit="cover"
                cachePolicy="none"
              />
            ) : (
              <View style={styles.placeholder}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={30}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.uploadText}>Add Listing Photo</Text>
                <Text style={styles.uploadSub}>Tap to upload (Optional)</Text>
              </View>
            )}
            {image && (
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="pencil" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Aqua Flow"
                placeholderTextColor={COLORS.textMuted}
                value={form.name}
                onChangeText={(t) => handleChange("name", t)}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.label}>Base Price ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="40"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={form.base_price}
                  onChangeText={(t) => handleChange("base_price", t)}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ETA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Same Day"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.eta}
                  onChangeText={(t) => handleChange("eta", t)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+263 77..."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(t) => handleChange("phone", t)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Areas</Text>
              <Text style={styles.helperText}>Separate with commas</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Greendale, Msasa"
                placeholderTextColor={COLORS.textMuted}
                value={form.locations}
                onChangeText={(t) => handleChange("locations", t)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.secondary, "#38A169"]}
              style={styles.btnGradient}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.btnText}>
                    {isEditMode ? "UPDATE LISTING" : "PUBLISH LISTING"}
                  </Text>
                  <MaterialCommunityIcons
                    name={isEditMode ? "content-save" : "check"}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, color: "white", fontFamily: FONTS.bold },
  scrollContent: { padding: 20, paddingBottom: 50 },
  imagePicker: {
    height: 200,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center" },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EBF8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadText: { fontSize: 16, color: COLORS.primary, fontFamily: FONTS.bold },
  uploadSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
  },
  editBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    color: COLORS.textSub,
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
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMain,
  },
  submitBtn: { borderRadius: 16, overflow: "hidden", elevation: 4 },
  btnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    gap: 10,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
});
