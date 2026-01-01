import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { COLORS } from "../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile Data State
  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    address: "", // Added Address for delivery
    role: "buyer",
  });

  // 1. Fetch Profile on Load
  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  }

  // 2. Update Profile function
  async function updateProfile() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        address: profile.address,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false); // Exit Edit Mode
    }
  }

  // Helper to handle Logout
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error", error.message);
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editBtn}
        >
          <MaterialCommunityIcons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color={COLORS.accent}
          />
          <Text style={styles.editBtnText}>
            {isEditing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- AVATAR SECTION --- */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.full_name
                ? profile.full_name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile.role === "seller" ? "Supplier Account" : "Buyer Account"}
            </Text>
          </View>
        </View>

        {/* --- FORM SECTION --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.full_name}
                onChangeText={(text) =>
                  setProfile({ ...profile, full_name: text })
                }
              />
            ) : (
              <Text style={styles.valueText}>
                {profile.full_name || "Not set"}
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.phone_number}
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setProfile({ ...profile, phone_number: text })
                }
              />
            ) : (
              <Text style={styles.valueText}>
                {profile.phone_number || "Not set"}
              </Text>
            )}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Default Delivery Address</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.address}
                placeholder="e.g. 42 Borrowdale Road"
                onChangeText={(text) =>
                  setProfile({ ...profile, address: text })
                }
              />
            ) : (
              <Text style={styles.valueText}>
                {profile.address || "No address saved"}
              </Text>
            )}
          </View>
        </View>

        {/* --- EDIT MODE ACTIONS --- */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={updateProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* --- SUPPLIER ACTIONS (Only visible if role is 'seller') --- */}
        {!isEditing && profile.role === "seller" && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionLabel}>BUSINESS TOOLS</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("CreateListing")}
            >
              <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
                <MaterialCommunityIcons
                  name="truck-plus"
                  size={22}
                  color={COLORS.accent}
                />
              </View>
              <Text style={styles.menuText}>Create New Listing</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* --- LOGOUT --- */}
        {!isEditing && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={COLORS.error}
            />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.textMain },
  editBtn: { flexDirection: "row", alignItems: "center", padding: 8 },
  editBtnText: { color: COLORS.accent, fontWeight: "600", marginLeft: 5 },

  // Profile Card
  profileHeader: { alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 5,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "white" },
  emailText: { fontSize: 16, color: COLORS.textSub, marginBottom: 5 },
  roleBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  // Forms
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textMuted,
    marginBottom: 15,
    letterSpacing: 1,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, color: COLORS.textSub, marginBottom: 5 },
  valueText: { fontSize: 16, color: COLORS.textMain, fontWeight: "500" },
  input: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // Actions
  saveBtn: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  // Menus
  menuSection: { marginBottom: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
  },

  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  logoutText: { color: COLORS.error, fontWeight: "bold", marginLeft: 8 },
});
