import React, { useState, useEffect } from "react";
import { FONTS } from "../theme/typography";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { COLORS } from "../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    role: "buyer",
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

  async function updateProfile() {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...profile,
      updated_at: new Date(),
    });
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
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <LinearGradient
          colors={[COLORS.accent, COLORS.accentDark]}
          style={[styles.header, { paddingTop: insets.top + 30 }]}
        >
          <View style={styles.headerTopRow}>
            <Text style={styles.pageTitle}>My Profile</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>
                {isEditing ? "Done" : "Edit"}
              </Text>
              <MaterialCommunityIcons
                name={isEditing ? "check" : "pencil"}
                size={16}
                color={COLORS.gold}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : "U"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>
                {profile.full_name || "Name Not Set"}
              </Text>
              <Text style={styles.emailText}>{user?.email}</Text>
              <View style={styles.roleContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color={COLORS.gold}
                />
                <Text style={styles.roleText}>
                  {profile.role === "seller"
                    ? "Verified Supplier"
                    : "Verified Buyer"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* --- DETAILS SECTION --- */}
        <View style={styles.content}>
          <Text style={styles.sectionHeader}>ACCOUNT DETAILS</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={28}
                color={COLORS.accent}
                style={styles.icon}
              />
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={profile.full_name}
                    onChangeText={(t) =>
                      setProfile({ ...profile, full_name: t })
                    }
                  />
                ) : (
                  <Text style={styles.value}>{profile.full_name || "—"}</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={28}
                color={COLORS.accent}
                style={styles.icon}
              />
              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={profile.phone_number}
                    onChangeText={(t) =>
                      setProfile({ ...profile, phone_number: t })
                    }
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.value}>
                    {profile.phone_number || "—"}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={28}
                color={COLORS.accent}
                style={styles.icon}
              />
              <View style={styles.field}>
                <Text style={styles.label}>Delivery Address</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={profile.address}
                    onChangeText={(t) => setProfile({ ...profile, address: t })}
                  />
                ) : (
                  <Text style={styles.value}>{profile.address || "—"}</Text>
                )}
              </View>
            </View>
          </View>

          {/* --- ACTIONS --- */}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={updateProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}

          {!isEditing && profile.role === "seller" && (
            <TouchableOpacity
              style={styles.goldBtn}
              onPress={() => navigation.navigate("CreateListing")}
            >
              <LinearGradient
                colors={[COLORS.gold, "#B8860B"]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
                <Text style={styles.goldBtnText}>Create New Listing</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    paddingHorizontal: 25,
    paddingBottom: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  pageTitle: { fontSize: 34, color: "white", fontFamily: FONTS.serif }, // Playfair Display
  nameText: {
    fontSize: 22,
    color: "white",
    marginBottom: 4,
    fontFamily: FONTS.bold,
  }, // Lato Bold
  sectionHeader: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 15,
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  value: { fontSize: 18, color: COLORS.textMain, fontFamily: FONTS.regular },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: { color: COLORS.gold, fontWeight: "bold", marginRight: 5 },

  // Profile Card
  profileCard: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: COLORS.accentDark },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  emailText: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },

  // Content
  content: { paddingHorizontal: 20, marginTop: 25 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMuted,
    marginBottom: 15,
    letterSpacing: 1,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  icon: { marginRight: 20, opacity: 0.8 },
  field: { flex: 1 },
  label: {
    fontSize: 13,
    color: COLORS.textSub,
    marginBottom: 4,
    fontWeight: "600",
  },
  value: { fontSize: 18, color: COLORS.textMain, fontWeight: "500" },
  input: {
    fontSize: 18,
    color: COLORS.textMain,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
    marginLeft: 50,
  },

  // Buttons
  saveBtn: {
    backgroundColor: COLORS.accent,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 5,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  goldBtn: { borderRadius: 16, overflow: "hidden", elevation: 5 },
  btnGradient: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 18,
    alignItems: "center",
  },
  goldBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  logoutBtn: { padding: 20, alignItems: "center", marginTop: 10 },
  logoutText: { color: COLORS.textMuted, fontWeight: "bold" },
});
