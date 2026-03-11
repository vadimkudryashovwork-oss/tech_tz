function formatPrice(price: number) {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
  const commaIdx = formatted.indexOf(',')
  const intPart = commaIdx >= 0 ? formatted.slice(0, commaIdx) : formatted
  const decPart = commaIdx >= 0 ? formatted.slice(commaIdx + 1) : '00'
  return { intPart, decPart }
}

export { formatPrice }
