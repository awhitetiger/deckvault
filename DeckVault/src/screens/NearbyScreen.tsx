import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NearbyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Nearby</Text>
      <Text style={styles.subtext}>Coming in Week 8</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subtext: { color: '#555577', fontSize: 14, marginTop: 8 },
});