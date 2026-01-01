import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext"; // Import Auth Context
import { COLORS } from "../theme/colors";

const { width } = Dimensions.get("window");

export default function AuthScreen({ navigation }) {
  const { user } = useAuth(); // Check user status
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer"); // 'buyer' or 'seller'

  // --- 1. THE FIX: AUTO-REDIRECT ---
  // If the user logs in successfully, this code sees the change and moves them.
  useEffect(() => {
    if (user) {
      navigation.replace("MainTabs");
    }
  }, [user]);

  async function handleAuth() {
    if (!email || !password)
      return Alert.alert("Missing Info", "Please enter email and password.");

    // Validation for Sign Up
    if (!isLogin) {
      if (!fullName)
        return Alert.alert("Missing Info", "Please enter your name.");
      if (!phone)
        return Alert.alert("Missing Info", "Please enter your phone number.");
    }

    setLoading(true);

    if (isLogin) {
      // --- LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) Alert.alert("Login Failed", error.message);
      // No need to navigate here manually; the useEffect above handles it!
    } else {
      // --- SIGN UP ---
      const {
        data: { user: newUser },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        Alert.alert("Sign Up Error", signUpError.message);
        setLoading(false);
        return;
      }

      if (newUser) {
        // Create Profile with ROLE
        const { error: profileError } = await supabase.from("profiles").insert({
          id: newUser.id,
          full_name: fullName,
          phone_number: phone,
          role: role, // <--- Saving the Role
        });

        if (profileError) {
          Alert.alert("Profile Error", profileError.message);
        } else {
          Alert.alert("Welcome!", "Your account has been created.");
        }
      }
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="water"
            size={60}
            color={COLORS.accent}
          />
          <Text style={styles.title}>Water Drop</Text>
        </View>

        {/* Toggle Switch (Login vs Sign Up) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text
              style={[styles.toggleText, isLogin && styles.toggleTextActive]}
            >
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text
              style={[styles.toggleText, !isLogin && styles.toggleTextActive]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {/* --- ROLE SELECTOR (Only for Sign Up) --- */}
          {!isLogin && (
            <View style={styles.roleContainer}>
              <Text style={styles.fieldLabel}>I want to:</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === "buyer" && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole("buyer")}
                >
                  <MaterialCommunityIcons
                    name="cart-outline"
                    size={24}
                    color={role === "buyer" ? "white" : COLORS.textSub}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "buyer" && styles.roleTextActive,
                    ]}
                  >
                    Buy Water
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === "seller" && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole("seller")}
                >
                  <MaterialCommunityIcons
                    name="truck-delivery-outline"
                    size={24}
                    color={role === "seller" ? "white" : COLORS.textSub}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "seller" && styles.roleTextActive,
                    ]}
                  >
                    Sell Water
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Fields */}
          {!isLogin && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {isLogin ? "Log In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: COLORS.background,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 30 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginTop: 10,
  },

  // Toggle Styles
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 25,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleBtnActive: { backgroundColor: "white", elevation: 2 },
  toggleText: { fontWeight: "600", color: COLORS.textSub },
  toggleTextActive: { color: COLORS.textMain, fontWeight: "bold" },

  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
  },

  // Role Styles
  roleContainer: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 10,
  },
  roleRow: { flexDirection: "row", gap: 10 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  roleBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  roleText: { fontWeight: "600", color: COLORS.textSub },
  roleTextActive: { color: "white" },

  input: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  btn: {
    backgroundColor: COLORS.accent,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
