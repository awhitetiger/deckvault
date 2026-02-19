import { View, Text, StyleSheet } from 'react-native';

export default function BinderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Binder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});