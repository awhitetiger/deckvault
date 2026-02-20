import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { binderService } from '../services/api';
import BinderGrid from '../components/BinderGrid';

export default function BinderScreen({ route, navigation }: any) {
  const params = route.params || {};
  const { binderId } = params;
  const [binderName, setBinderName] = useState(params.binderName || '');
  const [coverColor, setCoverColor] = useState(params.coverColor || '#7c3aed');
  const [sleeveStyle, setSleeveStyle] = useState(params.sleeveStyle || 'none');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(cards.length / 9));

  const loadCards = async () => {
    try {
      const data = await binderService.getBinderCards(binderId);
      setCards(data);
    } catch {
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Pick up any updated params from BinderSettings navigation
      if (route.params?.binderName) setBinderName(route.params.binderName);
      if (route.params?.coverColor) setCoverColor(route.params.coverColor);
      if (route.params?.sleeveStyle) setSleeveStyle(route.params.sleeveStyle);

      if (binderId) loadCards();
      else setLoading(false);
    }, [route.params])
  );

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  if (!binderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Open a binder from the Home tab</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: coverColor }]}>
        <Text style={styles.title}>{binderName}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('BinderSettings', {
              binderId,
              binderName,
              coverColor,
              sleeveStyle,
            })}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: coverColor }]}
            onPress={() => navigation.navigate('CardSearch', { binderId })}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.binderContainer}>
        {cards.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No cards yet.</Text>
            <Text style={styles.emptySubtext}>Tap + Add to search for cards.</Text>
          </View>
        ) : (
          <BinderGrid
            cards={cards}
            page={currentPage}
            onCardPress={(card) => navigation.navigate('CardDetail', { card, binderId })}
          />
        )}
      </View>

      <View style={styles.pageControls}>
        <TouchableOpacity
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>Page {currentPage} of {totalPages}</Text>

        <TouchableOpacity
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageBtnText}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 2,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  settingsButton: {
    backgroundColor: '#1a1a2e', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8,
  },
  settingsButtonText: { fontSize: 16 },
  addButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  binderContainer: { flex: 1 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
  pageControls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 16, gap: 24,
  },
  pageBtn: {
    backgroundColor: '#1a1a2e', paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 10,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { color: '#fff', fontSize: 20 },
  pageIndicator: { color: '#888', fontSize: 14 },
});