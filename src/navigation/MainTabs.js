import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/typography";

// Import Screens
import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 10, // Android Shadow
          shadowColor: "#000", // iOS Shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.accent, // Navy for active
        tabBarInactiveTintColor: "#949AB0", // Grey for inactive
        tabBarLabelStyle: {
          fontFamily: FONTS.bold,
          fontSize: 10,
          marginTop: -5,
        },
      }}
    >
      {/* 1. HOME (Market) */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Market",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 2. ORDERS */}
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 3. PROFILE (Menu) */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
