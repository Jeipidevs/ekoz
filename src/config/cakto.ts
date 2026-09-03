// Links de checkout hospedados pela Cakto (criados via API em 02/09/2026).
// Não são secretos — são a página pública de pagamento de cada oferta.
export const CAKTO_CHECKOUT = {
  annual: {
    label: 'Acesso Anual',
    price: '12x de R$ 597',
    period: 'no cartão',
    cashNote: 'Pague à vista: tenha até 50% de desconto e ganhe 6 mil reais em bônus.',
    url: 'https://pay.cakto.com.br/m77xw7k',
  },
  monthly: {
    label: 'Acesso Mensal',
    price: 'R$ 997',
    period: '/mês recorrente',
    url: 'https://pay.cakto.com.br/j8po6kd',
  },
} as const;
