import Stripe from "stripe"

const apiKey = process.env.STRIPE_SECRET_KEY || "placeholder_key_for_build"

export const stripe = new Stripe(apiKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
})


export const STRIPE_PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC ?? "",
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
} as const

export const PLAN_DETAILS = {
  basic: {
    name: "Basic",
    price: 99,
    features: [
      "2 barbeiros",
      "10 serviços",
      "200 agendamentos/mês",
      "Página pública",
      "Suporte por email",
    ],
  },
  pro: {
    name: "Pro",
    price: 199,
    features: [
      "5 barbeiros",
      "30 serviços",
      "1.000 agendamentos/mês",
      "WhatsApp integrado",
      "Relatórios avançados",
      "Suporte por chat",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 399,
    features: [
      "Barbeiros ilimitados",
      "Serviços ilimitados",
      "Agendamentos ilimitados",
      "Domínio próprio",
      "API access",
      "Suporte dedicado",
      "Relatórios completos + export",
    ],
  },
} as const
