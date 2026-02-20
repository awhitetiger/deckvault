import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { binderService } from '../services/api';

const COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#dc2626',
  '#d97706', '#db2777', '#0891b2', '#1a1a2e',
];

const SLEEVE_STYLES = [
  { id: 'none', label: 'None' },
  { id: 'dragon', label: '🐉 Dragon' },
  { id: 'dark', label: '🌑 Dark' },
  { id: 'gold', label: '✨ Gold' },
  { id: 'ocean', label: '🌊 Ocean' },
  { id: 'fire', label: '🔥 Fire' },
];

export default function BinderSettingsScreen({ route, navigation }: any) {
  const { binderId, binderName, coverColor, sleeveStyle } = route.params;
  const [name, setName] = useState(binderName || '');
  const [selectedColor, setSelectedColor] = useState(coverColor || '#7c3aed');
  const [selectedSleeve, setSelectedSleeve] = useState(sleeveStyle || 'none');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Binder name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await binderService.updateBinder(binderId, {
        name: name.trim(),
        cover_color: selectedColor,
        sleeve_style: selectedSleeve,
      });
      Alert.alert('Saved!', 'Binder updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Main', {
            screen: 'Binder',
            params: {
              binderId,
              binderName: name.trim(),
              coverColor: selectedColor,
              sleeveStyle: selectedSleeve,
            },
          }),
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save binder settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Binder Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#555577"
          maxLength={50}
        />

        <Text style={styles.label}>Cover Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                selectedColor === color && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <Text style={styles.label}>Sleeve Style</Text>
        <View style={styles.sleeveGrid}>
          {SLEEVE_STYLES.map((sleeve) => (
            <TouchableOpacity
              key={sleeve.id}
              style={[
                styles.sleeveBtn,
                selectedSleeve === sleeve.id && styles.sleeveBtnActive,
              ]}
              onPress={() => setSelectedSleeve(sleeve.id)}
            >
              <Text style={[
                styles.sleeveBtnText,
                selectedSleeve === sleeve.id && styles.sleeveBtnTextActive,
              ]}>
                {sleeve.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={save} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  scroll: { padding: 20 },
  label: { color: '#888', fontSize: 13, marginBottom: 10, marginTop: 20 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff', padding: 16,
    borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#2a2a4a',
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorSwatch: { width: 44, height: 44, borderRadius: 22 },
  colorSwatchSelected: { borderWidth: 3, borderColor: '#fff' },
  sleeveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sleeveBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2a2a4a',
  },
  sleeveBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  sleeveBtnText: { color: '#888', fontSize: 14 },
  sleeveBtnTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: '#7c3aed', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 40,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});