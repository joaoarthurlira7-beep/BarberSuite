import { Redirect } from 'expo-router'

export default function Index() {
  // Em um app real, checaríamos a sessão do Supabase aqui
  const isAuthenticated = false

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)" />
}
