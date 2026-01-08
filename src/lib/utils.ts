export function formatPhone(phone: string): string {
  
  if (phone.length === 13 && phone.startsWith('+254')) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 10)} ${phone.slice(10)}`
  }
  return phone
}


export const formatPhoneNumber = formatPhone

export function formatCurrency(amount: number): string {
  return `KSh ${amount.toLocaleString()}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
