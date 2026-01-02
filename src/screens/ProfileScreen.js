import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { FONTS } from "../theme/typography";

// Swiss Style Color Palette
const SWISS = {
  navy: "#0A1628",
  navyLight: "#1a2942",
  gold: "#D4AF37",
  goldLight: "#E8C96F",
  white: "#FFFFFF",
  offWhite: "#F2F4F8", // Slightly darker for better contrast
  grey: "#8B92A0",
  greyLight: "#E4E7EB",
};

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    role: "buyer",
    avatar_url: null,
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      setLoading(true);
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data);
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Permission Needed", "Please allow photo access.");
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) uploadImage(result.assets[0]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  async function uploadImage(imageAsset) {
    try {
      setUploading(true);
      const fileExt = imageAsset.uri.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const formData = new FormData();
      formData.append("file", {
        uri: imageAsset.uri,
        name: fileName,
        type: imageAsset.mimeType || "image/jpeg",
      });

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, formData, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      Alert.alert("Success", "Photo updated!");
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...profile, updated_at: new Date() });
    setSaving(false);
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success", "Profile Updated");
      setIsEditing(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={SWISS.gold} />
      </View>
    );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* 1. HERO HEADER (Inside ScrollView to prevent clipping) */}
          <LinearGradient
            colors={[SWISS.navy, SWISS.navyLight]}
            style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}
          >
            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={[styles.editButton, { top: insets.top + 20 }]}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "DONE" : "EDIT"}
              </Text>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.heroTitle}>Profile</Text>
              <View style={styles.titleUnderline} />
            </View>
          </LinearGradient>

          {/* 2. AVATAR BRIDGE (The Overlap Magic) */}
          <View style={styles.avatarBridge}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              style={styles.avatarWrapper}
              activeOpacity={0.8}
            >
              {uploading ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator color={SWISS.gold} size="large" />
                </View>
              ) : profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {profile.full_name
                      ? profile.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
              )}
              {/* Camera Icon */}
              <View style={styles.cameraIcon}>
                <MaterialCommunityIcons
                  name="camera"
                  size={16}
                  color={SWISS.navy}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* 3. CONTENT CARD */}
          <View style={styles.contentCard}>
            {/* Identity */}
            <View style={styles.identitySection}>
              <Text style={styles.displayName}>
                {profile.full_name || "Guest User"}
              </Text>
              <Text style={styles.emailAddress}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.roleText}>
                  {profile.role === "seller" ? "SUPPLIER" : "BUYER"}
                </Text>
              </View>
            </View>

            <View style={styles.spacer} />

            {/* Form Fields */}
            <View style={styles.infoGrid}>
              <Text style={styles.gridHeader}>ACCOUNT DETAILS</Text>

              {/* Full Name */}
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.gridInput}
                    value={profile.full_name}
                    onChangeText={(t) =>
                      setProfile({ ...profile, full_name: t })
                    }
                  />
                ) : (
                  <Text style={styles.gridValue}>
                    {profile.full_name || "—"}
                  </Text>
                )}
              </View>

              {/* Phone */}
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.gridInput}
                    value={profile.phone_number}
                    onChangeText={(t) =>
                      setProfile({ ...profile, phone_number: t })
                    }
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.gridValue}>
                    {profile.phone_number || "—"}
                  </Text>
                )}
              </View>

              {/* Address */}
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Delivery Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.gridInput, styles.multilineInput]}
                    value={profile.address}
                    onChangeText={(t) => setProfile({ ...profile, address: t })}
                    multiline
                  />
                ) : (
                  <Text style={[styles.gridValue, styles.multilineValue]}>
                    {profile.address || "—"}
                  </Text>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionZone}>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={updateProfile}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={[SWISS.gold, SWISS.goldLight]}
                    style={styles.gradientButton}
                  >
                    {saving ? (
                      <ActivityIndicator color={SWISS.navy} />
                    ) : (
                      <Text style={styles.primaryActionText}>SAVE CHANGES</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <>
                  {profile.role === "seller" && (
                    <TouchableOpacity
                      style={styles.secondaryAction}
                      onPress={() => navigation.navigate("CreateListing")}
                    >
                      <MaterialCommunityIcons
                        name="store-plus-outline"
                        size={22}
                        color={SWISS.gold}
                      />
                      <Text style={styles.secondaryActionText}>
                        MANAGE LISTINGS
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.logoutAction}
                    onPress={handleLogout}
                  >
                    <MaterialCommunityIcons
                      name="logout-variant"
                      size={20}
                      color={SWISS.grey}
                    />
                    <Text style={styles.logoutText}>Sign Out</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SWISS.offWhite },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 0 },

  // --- 1. HEADER ---
  heroHeader: {
    height: 300, // Tall header
    paddingHorizontal: 32,
    justifyContent: "flex-end",
    paddingBottom: 50,
  },
  editButton: {
    position: "absolute",
    right: 32,
    backgroundColor: SWISS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  editButtonText: {
    fontSize: 11,
    color: SWISS.navy,
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
  },
  titleContainer: { marginBottom: 10 },
  heroTitle: {
    fontSize: 56,
    color: SWISS.white,
    fontFamily: FONTS.serif, // Editorial Look
    letterSpacing: -1,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: SWISS.gold,
    marginTop: 8,
  },

  // --- 2. AVATAR BRIDGE (THE FIX) ---
  avatarBridge: {
    alignItems: "center",
    marginTop: -90, // Pull UP into the blue header
    marginBottom: -60, // Pull the white card UP behind the avatar
    zIndex: 10, // Ensure avatar sits on top
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SWISS.white,
    borderWidth: 4,
    borderColor: SWISS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 60 },
  avatarPlaceholder: {
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 42,
    color: "#666",
    fontFamily: FONTS.serif,
  },
  avatarLoading: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SWISS.gold,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: SWISS.white,
  },

  // --- 3. CONTENT CARD (THE FIX) ---
  contentCard: {
    backgroundColor: SWISS.white,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingTop: 70, // Push text DOWN so it doesn't touch the avatar
    paddingHorizontal: 24,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  identitySection: { alignItems: "center", marginBottom: 8 },
  displayName: {
    fontSize: 24,
    color: SWISS.navy,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 14,
    color: SWISS.grey,
    fontFamily: FONTS.regular,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SWISS.offWhite,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SWISS.gold,
    marginRight: 6,
  },
  roleText: {
    fontSize: 10,
    color: SWISS.navy,
    fontFamily: FONTS.bold,
    letterSpacing: 0.8,
  },

  spacer: { height: 32 },

  infoGrid: { marginBottom: 32 },
  gridHeader: {
    fontSize: 11,
    color: SWISS.grey,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    marginBottom: 20,
  },
  gridRow: { marginBottom: 20 },
  gridLabel: {
    fontSize: 11,
    color: SWISS.grey,
    fontFamily: FONTS.bold,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  gridValue: {
    fontSize: 16,
    color: SWISS.navy,
    fontFamily: FONTS.regular,
  },
  multilineValue: { lineHeight: 24 },
  gridInput: {
    fontSize: 16,
    color: SWISS.navy,
    fontFamily: FONTS.regular,
    borderBottomWidth: 1,
    borderBottomColor: SWISS.gold,
    paddingVertical: 6,
  },
  multilineInput: { minHeight: 60, textAlignVertical: "top" },

  actionZone: { gap: 12 },
  primaryAction: { borderRadius: 12, overflow: "hidden" },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    fontSize: 13,
    color: SWISS.navy,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: SWISS.white,
    borderWidth: 1.5,
    borderColor: SWISS.gold,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryActionText: {
    fontSize: 13,
    color: SWISS.gold,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  logoutAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 13,
    color: SWISS.grey,
    fontFamily: FONTS.bold,
  },
});
