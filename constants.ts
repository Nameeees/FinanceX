
import { Transaction, TransactionType, Debt, DebtType, UserProfile, QuickAction } from './types';

// Lista ampliada de monedas con banderas, símbolos y zonas horarias
export const SUPPORTED_CURRENCIES = [
  // AMÉRICA
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸', rate: 1, timezone: 'America/New_York' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷', rate: 850, timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs', flag: '🇧🇴', rate: 6.9, timezone: 'America/La_Paz' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷', rate: 4.95, timezone: 'America/Sao_Paulo' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: '$', flag: '🇨🇦', rate: 1.35, timezone: 'America/Toronto' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱', rate: 960, timezone: 'America/Santiago' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴', rate: 3900, timezone: 'America/Bogota' },
  { code: 'CRC', name: 'Colón Costarricense', symbol: '₡', flag: '🇨🇷', rate: 515, timezone: 'America/Costa_Rica' },
  { code: 'CUP', name: 'Peso Cubano', symbol: '$', flag: '🇨🇺', rate: 24.0, timezone: 'America/Havana' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$', flag: '🇩🇴', rate: 58.5, timezone: 'America/Santo_Domingo' },
  { code: 'GTQ', name: 'Quetzal', symbol: 'Q', flag: '🇬🇹', rate: 7.8, timezone: 'America/Guatemala' },
  { code: 'HNL', name: 'Lempira', symbol: 'L', flag: '🇭🇳', rate: 24.7, timezone: 'America/Tegucigalpa' },
  { code: 'HTG', name: 'Gourde Haitiano', symbol: 'G', flag: '🇭🇹', rate: 132, timezone: 'America/Port-au-Prince' },
  { code: 'JMD', name: 'Dólar Jamaiquino', symbol: 'J$', flag: '🇯🇲', rate: 155, timezone: 'America/Jamaica' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽', rate: 17.50, timezone: 'America/Mexico_City' },
  { code: 'NIO', name: 'Córdoba', symbol: 'C$', flag: '🇳🇮', rate: 36.6, timezone: 'America/Managua' },
  { code: 'PAB', name: 'Balboa (Panamá)', symbol: 'B/.', flag: '🇵🇦', rate: 1.0, timezone: 'America/Panama' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', rate: 3.75, timezone: 'America/Lima' },
  { code: 'PYG', name: 'Guaraní', symbol: '₲', flag: '🇵🇾', rate: 7250, timezone: 'America/Asuncion' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$', flag: '🇺🇾', rate: 39.0, timezone: 'America/Montevideo' },
  { code: 'VES', name: 'Bolívar (Venezuela)', symbol: 'Bs', flag: '🇻🇪', rate: 36.0, timezone: 'America/Caracas' },
  
  // EUROPA
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.92, timezone: 'Europe/Berlin' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧', rate: 0.79, timezone: 'Europe/London' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'Fr', flag: '🇨🇭', rate: 0.88, timezone: 'Europe/Zurich' },
  { code: 'SEK', name: 'Corona Sueca', symbol: 'kr', flag: '🇸🇪', rate: 10.3, timezone: 'Europe/Stockholm' },
  { code: 'NOK', name: 'Corona Noruega', symbol: 'kr', flag: '🇳🇴', rate: 10.5, timezone: 'Europe/Oslo' },
  { code: 'DKK', name: 'Corona Danesa', symbol: 'kr', flag: '🇩🇰', rate: 6.9, timezone: 'Europe/Copenhagen' },
  { code: 'ISK', name: 'Corona Islandesa', symbol: 'kr', flag: '🇮🇸', rate: 138, timezone: 'Atlantic/Reykjavik' },
  { code: 'CZK', name: 'Corona Checa', symbol: 'Kč', flag: '🇨🇿', rate: 23.5, timezone: 'Europe/Prague' },
  { code: 'HUF', name: 'Forinto Húngaro', symbol: 'Ft', flag: '🇭🇺', rate: 360, timezone: 'Europe/Budapest' },
  { code: 'PLN', name: 'Zloty Polaco', symbol: 'zł', flag: '🇵🇱', rate: 4.0, timezone: 'Europe/Warsaw' },
  { code: 'RON', name: 'Leu Rumano', symbol: 'lei', flag: '🇷🇴', rate: 4.6, timezone: 'Europe/Bucharest' },
  { code: 'BGN', name: 'Lev Búlgaro', symbol: 'лв', flag: '🇧🇬', rate: 1.80, timezone: 'Europe/Sofia' },
  { code: 'RSD', name: 'Dinar Serbio', symbol: 'дин', flag: '🇷🇸', rate: 117, timezone: 'Europe/Belgrade' },
  { code: 'ALL', name: 'Lek Albanés', symbol: 'L', flag: '🇦🇱', rate: 95.0, timezone: 'Europe/Tirane' },
  { code: 'RUB', name: 'Rublo Ruso', symbol: '₽', flag: '🇷🇺', rate: 92, timezone: 'Europe/Moscow' },
  { code: 'UAH', name: 'Grivna Ucraniana', symbol: '₴', flag: '🇺🇦', rate: 38.0, timezone: 'Europe/Kiev' },
  { code: 'TRY', name: 'Lira Turca', symbol: '₺', flag: '🇹🇷', rate: 31, timezone: 'Europe/Istanbul' },

  // ASIA & PACÍFICO
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥', flag: '🇯🇵', rate: 150, timezone: 'Asia/Tokyo' },
  { code: 'CNY', name: 'Yuan Chino', symbol: '¥', flag: '🇨🇳', rate: 7.2, timezone: 'Asia/Shanghai' },
  { code: 'KRW', name: 'Won Surcoreano', symbol: '₩', flag: '🇰🇷', rate: 1330, timezone: 'Asia/Seoul' },
  { code: 'INR', name: 'Rupia India', symbol: '₹', flag: '🇮🇳', rate: 83, timezone: 'Asia/Kolkata' },
  { code: 'IDR', name: 'Rupia Indonesia', symbol: 'Rp', flag: '🇮🇩', rate: 15600, timezone: 'Asia/Jakarta' },
  { code: 'VND', name: 'Dong Vietnamita', symbol: '₫', flag: '🇻🇳', rate: 24500, timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'THB', name: 'Baht Tailandés', symbol: '฿', flag: '🇹🇭', rate: 36, timezone: 'Asia/Bangkok' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱', flag: '🇵🇭', rate: 56.0, timezone: 'Asia/Manila' },
  { code: 'MYR', name: 'Ringgit Malayo', symbol: 'RM', flag: '🇲🇾', rate: 4.75, timezone: 'Asia/Kuala_Lumpur' },
  { code: 'SGD', name: 'Dólar Singapur', symbol: 'S$', flag: '🇸🇬', rate: 1.34, timezone: 'Asia/Singapore' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$', flag: '🇭🇰', rate: 7.82, timezone: 'Asia/Hong_Kong' },
  { code: 'TWD', name: 'Dólar Taiwanés', symbol: 'NT$', flag: '🇹🇼', rate: 31.5, timezone: 'Asia/Taipei' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: '$', flag: '🇦🇺', rate: 1.52, timezone: 'Australia/Sydney' },
  { code: 'NZD', name: 'Dólar Neozelandés', symbol: '$', flag: '🇳🇿', rate: 1.60, timezone: 'Pacific/Auckland' },
  { code: 'PKR', name: 'Rupia Pakistaní', symbol: '₨', flag: '🇵🇰', rate: 280, timezone: 'Asia/Karachi' },
  { code: 'BDT', name: 'Taka Bangladesí', symbol: '৳', flag: '🇧🇩', rate: 110, timezone: 'Asia/Dhaka' },
  { code: 'KZT', name: 'Tenge Kazajo', symbol: '₸', flag: '🇰🇿', rate: 450, timezone: 'Asia/Almaty' },
  { code: 'UZS', name: 'Som Uzbeko', symbol: 'so\'m', flag: '🇺🇿', rate: 12500, timezone: 'Asia/Tashkent' },
  
  // ORIENTE MEDIO
  { code: 'AED', name: 'Dirham EAU', symbol: 'dh', flag: '🇦🇪', rate: 3.67, timezone: 'Asia/Dubai' },
  { code: 'SAR', name: 'Riyal Saudí', symbol: '﷼', flag: '🇸🇦', rate: 3.75, timezone: 'Asia/Riyadh' },
  { code: 'QAR', name: 'Riyal Qatarí', symbol: '﷼', flag: '🇶🇦', rate: 3.64, timezone: 'Asia/Qatar' },
  { code: 'ILS', name: 'Shekel Israelí', symbol: '₪', flag: '🇮🇱', rate: 3.6, timezone: 'Asia/Jerusalem' },
  { code: 'KWD', name: 'Dinar Kuwaití', symbol: 'د.ك', flag: '🇰🇼', rate: 0.31, timezone: 'Asia/Kuwait' },
  { code: 'BHD', name: 'Dinar Bahreiní', symbol: '.د.ب', flag: '🇧🇭', rate: 0.376, timezone: 'Asia/Bahrain' },
  { code: 'OMR', name: 'Riyal Omaní', symbol: '﷼', flag: '🇴🇲', rate: 0.38, timezone: 'Asia/Muscat' },
  { code: 'JOD', name: 'Dinar Jordano', symbol: 'د.ا', flag: '🇯🇴', rate: 0.71, timezone: 'Asia/Amman' },
  { code: 'LBP', name: 'Libra Libanesa', symbol: 'ل.ل', flag: '🇱🇧', rate: 15000, timezone: 'Asia/Beirut' },
  { code: 'IQD', name: 'Dinar Iraquí', symbol: 'ع.د', flag: '🇮🇶', rate: 1300, timezone: 'Asia/Baghdad' },

  // ÁFRICA
  { code: 'ZAR', name: 'Rand Sudafricano', symbol: 'R', flag: '🇿🇦', rate: 19, timezone: 'Africa/Johannesburg' },
  { code: 'EGP', name: 'Libra Egipcia', symbol: 'E£', flag: '🇪🇬', rate: 30.9, timezone: 'Africa/Cairo' },
  { code: 'NGN', name: 'Naira Nigeriana', symbol: '₦', flag: '🇳🇬', rate: 1500, timezone: 'Africa/Lagos' },
  { code: 'KES', name: 'Chelín Keniano', symbol: 'KSh', flag: '🇰🇪', rate: 145, timezone: 'Africa/Nairobi' },
  { code: 'GHS', name: 'Cedi Ghanés', symbol: '₵', flag: '🇬🇭', rate: 12.5, timezone: 'Africa/Accra' },
  { code: 'MAD', name: 'Dirham Marroquí', symbol: 'dh', flag: '🇲🇦', rate: 10.0, timezone: 'Africa/Casablanca' },
  { code: 'DZD', name: 'Dinar Argelino', symbol: 'د.ج', flag: '🇩🇿', rate: 134, timezone: 'Africa/Algiers' },
  { code: 'TND', name: 'Dinar Tunecino', symbol: 'د.ت', flag: '🇹🇳', rate: 3.1, timezone: 'Africa/Tunis' },
  { code: 'AOA', name: 'Kwanza Angoleño', symbol: 'Kz', flag: '🇦🇴', rate: 830, timezone: 'Africa/Luanda' },
];

export const MOCK_USER: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@nexo.finance',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  currency: 'USD',
  timezone: 'America/New_York',
  monthlyGoal: 5000,
  security: {
    enabled: false,
    method: 'PIN',
    value: ''
  },
  cloudConfig: {
    enabled: false,
    provider: 'GITHUB',
    apiKey: '',
    binId: ''
  }
};

export const MOCK_DEBTS: Debt[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_QUICK_ACTIONS: QuickAction[] = [];

export const CATEGORY_COLORS: Record<string, string> = {
  'Salario': 'bg-emerald-500/20 text-emerald-400',
  'Comida': 'bg-orange-500/20 text-orange-400',
  'Entretenimiento': 'bg-purple-500/20 text-purple-400',
  'Transporte': 'bg-blue-500/20 text-blue-400',
  'Negocios': 'bg-cyan-500/20 text-cyan-400',
  'Servicios': 'bg-yellow-500/20 text-yellow-400',
  'Hogar': 'bg-pink-500/20 text-pink-400',
  'Default': 'bg-neutral-800 text-neutral-400'
};
