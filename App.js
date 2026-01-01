import React, { useEffect, useState, useCallback } from "react";
import { StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./src/lib/AuthContext";
import { COLORS } from "./src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen"; // Optional but good practice

// 1. IMPORT FONTS
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";

// Screens
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DetailScreen from "./src/screens/DetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CreateListingScreen from "./src/screens/CreateListingScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

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
        <Stack.Screen name="MainTabs" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        {user ? (
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="CreateListing"
              component={CreateListingScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // 2. LOAD FONTS HOOK
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  // 3. WAIT FOR FONTS
  if (!fontsLoaded) {
    return <View />; // Or a custom Splash Screen component
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
