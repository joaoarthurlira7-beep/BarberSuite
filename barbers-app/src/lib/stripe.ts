import { initStripe } from '@stripe/stripe-react-native';

// Essa chave deve vir do .env local
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

export const initializeStripe = async () => {
  await initStripe({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.barbersuite',
    urlScheme: 'barbersuite',
  });
  console.log('Stripe inicializado com sucesso.');
};
