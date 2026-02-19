import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import BinderScreen from './src/screens/BinderScreen';
import ScanScreen from './src/screens/ScanScreen';
import NearbyScreen from './src/screens/NearbyScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#ffffff',
          tabBarStyle: {
            backgroundColor: '#0f0f1a',
            borderTopColor: '#1a1a2e',
          },
          tabBarActiveTintColor: '#7c3aed',
          tabBarInactiveTintColor: '#555577',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: () => <Text>🏠</Text> }}
        />
        <Tab.Screen
          name="Binder"
          component={BinderScreen}
          options={{ tabBarIcon: () => <Text>📒</Text> }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{ tabBarIcon: () => <Text>📷</Text> }}
        />
        <Tab.Screen
          name="Nearby"
          component={NearbyScreen}
          options={{ tabBarIcon: () => <Text>📍</Text> }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarIcon: () => <Text>👤</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}