// ATENÇÃO: ARQUIVO APENAS PARA DEMONSTRAÇÃO LOCAL.
// NUNCA coloque uma chave "sk_live" real no código do aplicativo.
// Em produção, esta requisição deve ser feita de um backend seguro (ex: Supabase Edge Functions).

const STRIPE_SECRET_KEY = 'sk_test_51MockTestKeyForBarberSuiteDemoOnly_DoNotUseInProd'; // Chave fictícia ou de teste

export const createPaymentIntentMock = async (amountInBrl: number, customerName: string) => {
  try {
    const amountInCents = Math.round(amountInBrl * 100);

    // Na vida real, o Stripe exige parâmetros encodados como form-urlencoded, não JSON.
    const body = new URLSearchParams({
      amount: amountInCents.toString(),
      currency: 'brl',
      'payment_method_types[]': 'card',
      description: `Corte de Cabelo BarberSuite - ${customerName}`,
    });

    // Simulação: Devido à falta de uma conta Stripe real conectada, 
    // nós vamos forjar o funcionamento para o frontend do app abrir o Painel.
    // Como a biblioteca do Stripe recusa client_secrets inválidos nativamente,
    // se tivéssemos uma chave "sk_test" real nós faríamos o fetch abaixo:
    /*
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const data = await response.json();
    return { clientSecret: data.client_secret };
    */

    // Para evitar crash no app com a chave fictícia, nós vamos retornar um secret válido MOCK
    // Apenas para fins didáticos de UX e fluxo no aplicativo.
    // Na prática, sem o client_secret real da API do Stripe, a PaymentSheet falhará ao abrir.
    // Mas deixaremos a lógica pronta para ser substituída pela API.
    return { 
      clientSecret: 'pi_3Mock_secret_test123',
      ephemeralKey: 'ek_test_123',
      customer: 'cus_test123'
    };

  } catch (error) {
    console.error('Erro ao criar PaymentIntent:', error);
    throw error;
  }
};
