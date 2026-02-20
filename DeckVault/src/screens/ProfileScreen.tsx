import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  username: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  email: { color: '#888', fontSize: 16, marginTop: 8, marginBottom: 40 },
  logoutButton: { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
});