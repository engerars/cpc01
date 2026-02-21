
export const THEME_COLOR = 'indigo-600';
export const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

export const formatCurrency = (value: number) => CURRENCY_FORMATTER.format(value);
