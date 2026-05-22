import { Tabs } from 'expo-router'
import { BlurView } from 'expo-blur'
import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: true,
      headerTransparent: true,
      headerBackground: () => (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      ),
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
      },
      headerTintColor: '#fff',
      tabBarStyle: { 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0,
        borderTopWidth: 0,
        backgroundColor: 'transparent',
      },
      tabBarBackground: () => (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </View>
      ),
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#666',
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Agenda Hoje',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="clients" 
        options={{ 
          title: 'Meus Clientes',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="inventory" 
        options={{ 
          title: 'Estoque',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? "barcode" : "barcode-outline"} size={size} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Configurações',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
              {focused && <View style={styles.dot} />}
            </View>
          ),
        }} 
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 4,
    position: 'absolute',
    bottom: -8,
  }
})
