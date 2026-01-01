import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.text}>Create Listing Screen (Coming Soon)</Text>
      <Text style={styles.subText}>
        This screen has been updated to use the new Safe Area.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { fontSize: 20, fontWeight: "bold", color: COLORS.textMain },
  subText: { marginTop: 10, color: COLORS.textSub },
});
