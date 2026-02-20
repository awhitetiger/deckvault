import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Which TCG do you play?</Text>

      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>⚡ Yu-Gi-Oh!</Text>
        <Text style={styles.optionSub}>Coming soon: MTG, Pokémon</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f0f1a',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 40 },
  option: {
    width: '100%', backgroundColor: '#7c3aed',
    padding: 20, borderRadius: 12, alignItems: 'center',
  },
  optionText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  optionSub: { color: '#ddd', fontSize: 12, marginTop: 4 },
});