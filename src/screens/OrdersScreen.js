import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function OrdersScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Orders</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={40}
              color={COLORS.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>No Active Orders</Text>
          <Text style={styles.emptyText}>
            You haven't placed any water orders yet.
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.btnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F8" },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 28, color: "white", fontFamily: FONTS.serif },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyState: { alignItems: "center", width: "100%" },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: COLORS.textMain,
    fontFamily: FONTS.bold,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSub,
    fontFamily: FONTS.regular,
    textAlign: "center",
    marginBottom: 30,
  },

  btn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  btnText: { color: "white", fontFamily: FONTS.bold, fontSize: 14 },
});
