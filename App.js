import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { Image } from "expo-image"; // Optimized Image

// 1. Setup the Query Client (This manages the background data)
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrderScreen />
    </QueryClientProvider>
  );
}

function OrderScreen() {
  // 2. Fake "Backend" Request
  // This simulates a slow 3G network taking 3 seconds to respond
  const postOrderToBackend = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Order confirmed by server!");
      }, 3000); // 3 second delay
    });
  };

  // 3. The Magic Logic (Optimistic UI)
  const mutation = useMutation({
    mutationFn: postOrderToBackend,
    // This runs AFTER the server finally responds
    onSuccess: (data) => {
      console.log(data); // "Order confirmed by server!"
    },
  });

  // Visual State
  const isOrderPlaced =
    mutation.status === "success" || mutation.status === "pending";

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Water Drop 💧</Text>

      {/* Optimized Image Example */}
      <Image
        style={styles.waterImage}
        source="https://img.freepik.com/free-vector/water-delivery-concept-illustration_114360-6394.jpg"
        contentFit="cover"
        transition={500} // Smooth fade in
      />

      <View style={styles.card}>
        <Text style={styles.title}>20L Refill</Text>
        <Text style={styles.price}>$2.00</Text>

        <TouchableOpacity
          style={[
            styles.button,
            isOrderPlaced ? styles.buttonSuccess : styles.buttonNormal,
          ]}
          onPress={() => {
            if (!isOrderPlaced) mutation.mutate();
          }}
          activeOpacity={0.8}
        >
          {/* THE TRICK: We check 'isOrderPlaced' immediately. 
              We do NOT wait for 'mutation.isLoading' to finish. 
              This makes it feel instant. */}

          {isOrderPlaced ? (
            <Text style={styles.buttonText}>✅ Order Placed!</Text>
          ) : (
            <Text style={styles.buttonText}>Order Now</Text>
          )}
        </TouchableOpacity>

        {/* Small indicator to show it is actually syncing in background */}
        {mutation.status === "pending" && (
          <View style={styles.syncRow}>
            <ActivityIndicator size="small" color="#999" />
            <Text style={styles.syncText}> Syncing with driver...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  waterImage: {
    width: 300,
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Android shadow
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  price: {
    fontSize: 18,
    color: "green",
    marginBottom: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonNormal: {
    backgroundColor: "#007AFF", // Blue
  },
  buttonSuccess: {
    backgroundColor: "#34C759", // Green
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  syncRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  syncText: {
    color: "#999",
    fontSize: 12,
  },
});
