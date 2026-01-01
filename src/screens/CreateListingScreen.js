import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { COLORS } from "../theme/colors";

export default function CreateListingScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "", // Simplify to single string for MVP
    price: "",
    eta: "2 hrs",
    image_url:
      "https://img.freepik.com/free-vector/water-delivery-truck-illustration_1284-16812.jpg", // Default image
  });

  async function createListing() {
    if (!form.name || !form.price || !form.location)
      return Alert.alert("Missing Info");
    setLoading(true);

    const { error } = await supabase.from("suppliers").insert({
      name: form.name,
      locations: [form.location], // Converting string to array
      base_price: parseFloat(form.price),
      eta: form.eta,
      image_url: form.image_url,
      owner_id: user.id,
    });

    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success", "Your listing is now live!");
      navigation.goBack();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Listing</Text>

      <Text style={styles.label}>Company Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Kuziva Water"
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
      />

      <Text style={styles.label}>Base Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Avondale"
        value={form.location}
        onChangeText={(t) => setForm({ ...form, location: t })}
      />

      <Text style={styles.label}>Base Price ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="40"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(t) => setForm({ ...form, price: t })}
      />

      <Text style={styles.label}>Est. Delivery Time</Text>
      <TextInput
        style={styles.input}
        placeholder="2 hrs"
        value={form.eta}
        onChangeText={(t) => setForm({ ...form, eta: t })}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={createListing}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Publish Listing</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, backgroundColor: COLORS.background },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: COLORS.textMain,
    marginTop: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.textMain,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
