import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { binderService } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [binders, setBinders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBinders();
  }, []);

  const loadBinders = async () => {
    try {
      const data = await binderService.getBinders();
      setBinders(data);
    } catch {
      Alert.alert('Error', 'Failed to load binders');
    } finally {
      setLoading(false);
    }
  };

  const createBinder = async () => {
    try {
      const binder = await binderService.createBinder('New Binder');
      setBinders([binder, ...binders]);
    } catch {
      Alert.alert('Error', 'Failed to create binder');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {user?.username} 👋</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Binders</Text>
          <TouchableOpacity style={styles.addButton} onPress={createBinder}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {binders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No binders yet.</Text>
            <Text style={styles.emptySubtext}>Create your first binder to get started.</Text>
          </View>
        ) : (
          <FlatList
            data={binders}
            keyExtractor={(item) => item.id}
            onRefresh={loadBinders}
            refreshing={loading}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.binderCard, { borderLeftColor: item.cover_color || '#7c3aed' }]}
                onPress={() => navigation.navigate('Binder', {
                  binderId: item.id,
                  binderName: item.name,
                  coverColor: item.cover_color,
                  sleeveStyle: item.sleeve_style,
                })}
              >
                <Text style={styles.binderName}>{item.name}</Text>
                <Text style={styles.binderCount}>{item.card_count} cards</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  centered: { flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 32, marginTop: 8,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  logout: { color: '#555577', fontSize: 14 },
  section: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  addButton: { backgroundColor: '#7c3aed', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  binderCard: {
    backgroundColor: '#1a1a2e', padding: 16,
    borderRadius: 12, marginBottom: 12, borderLeftWidth: 4,
  },
  binderName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  binderCount: { color: '#888', fontSize: 13, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
});