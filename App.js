import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./src/lib/AuthContext";
import { COLORS } from "./src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

// FONTS
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";

// SCREENS
import AuthScreen from "./src/screens/AuthScreen";
import DetailScreen from "./src/screens/DetailScreen";
import CreateListingScreen from "./src/screens/CreateListingScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

// NAVIGATION
import MainTabs from "./src/navigation/MainTabs"; // <--- NEW IMPORT

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

function NavigationWrapper() {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    async function checkFirstLaunch() {
      const value = await AsyncStorage.getItem("alreadyLaunched");
      if (value === null) {
        await AsyncStorage.setItem("alreadyLaunched", "true");
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    }
    checkFirstLaunch();
  }, []);

  if (loading || isFirstLaunch === null) return null;

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
        initialRouteName={isFirstLaunch ? "Onboarding" : "MainTabs"}
      >
        {/* --- 1. MAIN TABS (The New Root) --- */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* --- 2. SCREENS THAT COVER TABS --- */}
        <Stack.Screen name="Detail" component={DetailScreen} />

        {/* --- 3. AUTH & FLOWS --- */}
        {!user && <Stack.Screen name="Auth" component={AuthScreen} />}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* Logged In Only */}
        {user && (
          <Stack.Screen name="CreateListing" component={CreateListingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    return <View />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationWrapper />
        </QueryClientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
