import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";

// --- CONFIGURATION ---
const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

// --- MOCK DATA (Simulating your Database) ---
const SELLERS = [
  {
    id: "1",
    name: "Mbare Musika Water",
    location: "Mbare",
    price: 2,
    rating: 4.8,
    image:
      "https://img.freepik.com/free-photo/water-delivery-man_23-2148834458.jpg",
  },
  {
    id: "2",
    name: "Avondale Refills",
    location: "Avondale",
    price: 3,
    rating: 4.5,
    image:
      "https://img.freepik.com/free-vector/bottled-water-branding-mockup_1017-6469.jpg",
  },
  {
    id: "3",
    name: "Chitungwiza Unit L",
    location: "Chitungwiza",
    price: 1.5,
    rating: 4.2,
    image:
      "https://img.freepik.com/free-vector/water-delivery-service-concept_23-2148498835.jpg",
  },
  {
    id: "4",
    name: "Borrowdale Pure",
    location: "Borrowdale",
    price: 5,
    rating: 5.0,
    image: "https://img.freepik.com/free-photo/glass-water_144627-16007.jpg",
  },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
          <Stack.Screen name="Order" component={OrderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

// --- SCREEN 1: LOGIN ---
function LoginScreen({ navigation }) {
  const [name, setName] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginCard}>
        <Text style={styles.header}>Water Drop 💧</Text>
        <Text style={styles.subHeader}>Zimbabwe's Water Marketplace</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kuziva"
            value={name}
            onChangeText={setName}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (name) navigation.replace("Marketplace", { user: name });
            else Alert.alert("Required", "Please enter your name");
          }}
        >
          <Text style={styles.buttonText}>Start Ordering</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- SCREEN 2: MARKETPLACE (The "Indrive" List) ---
function MarketplaceScreen({ navigation, route }) {
  const { user } = route.params;
  const [search, setSearch] = useState("");

  // Filter logic
  const filteredSellers = SELLERS.filter(
    (s) =>
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sellerCard}
      onPress={() => navigation.navigate("Order", { seller: item })}
    >
      <Image
        source={item.image}
        style={styles.sellerImage}
        contentFit="cover"
      />
      <View style={styles.sellerInfo}>
        <Text style={styles.sellerName}>{item.name}</Text>
        <Text style={styles.sellerLocation}>📍 {item.location}</Text>
        <View style={styles.sellerMeta}>
          <Text style={styles.sellerPrice}>
            ${item.price.toFixed(2)} / bucket
          </Text>
          <Text style={styles.sellerRating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.marketHeader}>
        <Text style={styles.welcomeText}>Hi, {user} 👋</Text>
        <Text style={styles.subHeader}>Find water near you</Text>

        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search location (e.g. Mbare)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.listContainer}>
        <FlashList
          data={filteredSellers}
          renderItem={renderItem}
          estimatedItemSize={100}
          contentContainerStyle={{ padding: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

// --- SCREEN 3: ORDER (Your existing logic) ---
function OrderScreen({ route, navigation }) {
  const { seller } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");

  const postOrder = async () => new Promise((r) => setTimeout(r, 2000));
  const mutation = useMutation({ mutationFn: postOrder });
  const isOrdered =
    mutation.status === "success" || mutation.status === "pending";

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={{ color: "#007AFF", fontSize: 16 }}>← Back</Text>
      </TouchableOpacity>

      <Image
        style={styles.waterImage}
        source={seller.image}
        contentFit="cover"
      />

      <View style={styles.card}>
        <Text style={styles.title}>{seller.name}</Text>
        <Text style={styles.price}>${seller.price.toFixed(2)} per bucket</Text>

        {/* Quantity */}
        <View style={styles.row}>
          <Text style={styles.label}>Buckets:</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.counterBtn}
            >
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.countValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.counterBtn}
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Input */}
        <TextInput
          style={styles.input}
          placeholder="Where are you exactly?"
          value={location}
          onChangeText={setLocation}
        />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalPrice}>
            ${(quantity * seller.price).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isOrdered ? styles.buttonSuccess : styles.buttonNormal,
          ]}
          onPress={() => {
            if (!location) Alert.alert("Location needed");
            else mutation.mutate();
          }}
        >
          {isOrdered ? (
            <Text style={styles.buttonText}>✅ Sent to {seller.name}!</Text>
          ) : (
            <Text style={styles.buttonText}>Order Now</Text>
          )}
        </TouchableOpacity>

        {mutation.status === "pending" && (
          <ActivityIndicator style={{ marginTop: 10 }} />
        )}
      </View>
    </ScrollView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    padding: 20,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: StatusBar.currentHeight,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f5f5f5",
  },

  // Login Styles
  loginCard: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    elevation: 5,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },

  // Marketplace Styles
  marketHeader: {
    padding: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: "#333" },
  searchInput: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    fontSize: 16,
  },
  listContainer: { flex: 1 },

  // Seller Card Styles
  sellerCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
  },
  sellerImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  sellerInfo: { flex: 1, justifyContent: "center" },
  sellerName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  sellerLocation: { color: "#666", marginTop: 4 },
  sellerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sellerPrice: { color: "green", fontWeight: "bold" },
  sellerRating: { color: "#FFD700", fontWeight: "bold" },

  // Order Screen Styles
  waterImage: { width: "90%", height: 200, borderRadius: 15, marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: "600" },
  price: { fontSize: 18, color: "green", marginBottom: 15 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  counterBtn: { padding: 10, paddingHorizontal: 15 },
  counterText: { fontSize: 20, fontWeight: "bold", color: "#007AFF" },
  countValue: { fontSize: 18, fontWeight: "bold", marginHorizontal: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  totalText: { fontSize: 18, fontWeight: "bold" },
  totalPrice: { fontSize: 20, fontWeight: "bold", color: "#007AFF" },
  button: { paddingVertical: 15, borderRadius: 10, alignItems: "center" },
  buttonNormal: { backgroundColor: "#007AFF" },
  buttonSuccess: { backgroundColor: "#34C759" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  backButton: { alignSelf: "flex-start", marginLeft: 20, marginBottom: 10 },
});
