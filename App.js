import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./src/lib/AuthContext";
import { COLORS } from "./src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
        initialRouteName={isFirstLaunch ? "Onboarding" : "MainTabs"}
      >
        {/* --- 1. SHARED SCREENS (Everyone can see these) --- */}
        <Stack.Screen name="MainTabs" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />

        {user ? (
          // --- 2. LOGGED IN ONLY (Auth Screen is removed!) ---
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="CreateListing"
              component={CreateListingScreen}
            />
          </>
        ) : (
          // --- 3. GUEST ONLY (Hidden when logged in) ---
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
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationWrapper />
      </QueryClientProvider>
    </AuthProvider>
  );
}
