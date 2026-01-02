import { Platform } from "react-native";

// Use system defaults for a native, fast, and clean feel
const sansSerif = Platform.select({
  ios: "System",
  android: "Roboto_400Regular",
});
const sansSerifBold = Platform.select({
  ios: "System",
  android: "Roboto_700Bold",
});

export const FONTS = {
  // We map everything to sans-serif for a modern utility look
  serif: sansSerifBold, // Used for headers
  serifRegular: sansSerif,
  regular: sansSerif, // Used for body text
  bold: sansSerifBold, // Used for emphasis
};
