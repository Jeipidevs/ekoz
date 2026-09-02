// Links de checkout hospedados pela Cakto (criados via API em 02/09/2026).
// Não são secretos — são a página pública de pagamento de cada oferta.
export const CAKTO_CHECKOUT = {
  annual: {
    label: 'Acesso Anual',
    price: 'R$ 6.000',
    period: '/ano (em até 12x no cartão)',
    url: 'https://pay.cakto.com.br/m77xw7k',
  },
  monthly: {
    label: 'Acesso Mensal',
    price: 'R$ 997',
    period: '/mês recorrente',
    url: 'https://pay.cakto.com.br/j8po6kd',
  },
} as const;
