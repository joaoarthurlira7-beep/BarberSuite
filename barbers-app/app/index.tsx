import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    }).catch(() => {
      setIsAuthenticated(false)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)" />
}
