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
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";

export default function ProfileScreen({ navigation }) {
  // 1. CALL ALL HOOKS AT THE TOP (Regardless of user state)
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

  // 2. USE EFFECTS (Always called, logic inside handles checks)
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false); // Stop loading if guest
    }
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
      if (status !== "granted")
        return Alert.alert("Permission Needed", "Please allow photo access.");
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
    if (!user) return;
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
    if (!user) return;
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

  // 3. CONDITIONAL RENDERING (This MUST be after all hooks)

  // -- A. GUEST VIEW --
  if (!user) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={[styles.guestHeader, { paddingTop: insets.top + 40 }]}
        >
          <MaterialCommunityIcons name="water" size={80} color="white" />
          <Text style={styles.guestTitle}>Welcome to Water Drop</Text>
          <Text style={styles.guestSub}>
            The easiest way to order water in Zimbabwe.
          </Text>
        </LinearGradient>

        <View style={styles.guestContent}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate("Auth")}
          >
            <Text style={styles.primaryActionText}>SIGN IN / REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -- B. LOADING VIEW --
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // -- C. LOGGED IN VIEW --
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>
                {isEditing ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* IDENTITY CARD */}
          <View style={styles.identityCard}>
            <View style={styles.avatarRow}>
              <TouchableOpacity onPress={pickImage} disabled={uploading}>
                <View style={styles.avatarContainer}>
                  {uploading ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : profile.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {profile.full_name
                          ? profile.full_name.charAt(0).toUpperCase()
                          : "U"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <MaterialCommunityIcons
                      name="camera"
                      size={14}
                      color="white"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.identityText}>
                <Text style={styles.fullName}>
                  {profile.full_name || "Guest User"}
                </Text>
                <Text style={styles.emailText}>{user?.email}</Text>
                <View
                  style={[
                    styles.roleTag,
                    profile.role === "seller"
                      ? styles.roleSeller
                      : styles.roleBuyer,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      profile.role === "seller"
                        ? { color: "#B7791F" }
                        : { color: COLORS.primary },
                    ]}
                  >
                    {profile.role === "seller"
                      ? "Supplier Account"
                      : "Buyer Account"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.phone_number}
                  onChangeText={(t) =>
                    setProfile({ ...profile, phone_number: t })
                  }
                  keyboardType="phone-pad"
                  placeholder="+263..."
                />
              ) : (
                <Text style={styles.value}>
                  {profile.phone_number || "Not set"}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery Address</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.address}
                  onChangeText={(t) => setProfile({ ...profile, address: t })}
                  placeholder="Street, Suburb, City"
                />
              ) : (
                <Text style={styles.value}>{profile.address || "Not set"}</Text>
              )}
            </View>

            {isEditing && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={profile.full_name}
                  onChangeText={(t) => setProfile({ ...profile, full_name: t })}
                />
              </View>
            )}
          </View>

          {/* ACTIONS */}
          <View style={styles.actionSection}>
            {isEditing ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={updateProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                {profile.role === "seller" && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate("MyListings")}
                  >
                    <MaterialCommunityIcons
                      name="store-plus"
                      size={20}
                      color={COLORS.secondary}
                    />
                    <Text style={styles.secondaryBtnText}>Manage Listings</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color={COLORS.textSub}
                  />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 0 },

  // GUEST
  guestHeader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 60,
  },
  guestTitle: {
    fontSize: 24,
    color: "white",
    fontFamily: FONTS.bold,
    marginTop: 20,
  },
  guestSub: {
    fontSize: 16,
    color: "#E2E8F0",
    fontFamily: FONTS.regular,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  guestContent: { flex: 1, padding: 40, justifyContent: "center" },

  // HEADER
  headerBg: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingBottom: 80,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, color: "white", fontFamily: FONTS.bold },
  editBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: { color: "white", fontFamily: FONTS.bold, fontSize: 12 },

  // IDENTITY CARD
  identityCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative", marginRight: 20 },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 32,
    color: COLORS.textSub,
    fontFamily: FONTS.bold,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },

  identityText: { flex: 1 },
  fullName: {
    fontSize: 20,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
    color: COLORS.textSub,
    fontFamily: FONTS.regular,
    marginBottom: 8,
  },

  roleTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBuyer: { backgroundColor: "#EBF8FF" },
  roleSeller: { backgroundColor: "#FFFFF0" },
  roleText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // FORM
  formContainer: { padding: 25 },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 5,
    fontFamily: FONTS.bold,
  },
  value: { fontSize: 16, color: COLORS.textMain, fontFamily: FONTS.regular },
  input: {
    fontSize: 16,
    color: COLORS.textMain,
    fontFamily: FONTS.regular,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },

  // ACTIONS
  actionSection: { paddingHorizontal: 25, gap: 15 },
  primaryBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryAction: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  primaryActionText: { color: "white", fontFamily: FONTS.bold, fontSize: 14 },
  btnText: { color: "white", fontFamily: FONTS.bold, fontSize: 16 },

  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  logoutText: { color: COLORS.textSub, fontFamily: FONTS.bold, fontSize: 14 },
});
