import { Icons } from '@/components/icons'

export const membershipConfig = {
  fall: {
    product_id: 'price_1MoF6qKMISeWWjOmvQtEcz6q',
    display_price: 45, // change actual price inside stripe dashboard
    icon: Icons.calendar_half({ className: 'mb-3 h-20 w-20' }),
  },
  spring: {
    product_id: 'price_1MoF7BKMISeWWjOmkW5lNbpe',
    display_price: 45, // change actual price inside stripe dashboard
    icon: Icons.calendar_half({ className: 'mb-3 h-20 w-20' }),
  },
  year: {
    product_id: 'price_1MoF6XKMISeWWjOmLrqiyiHF',
    display_price: 80, // change actual price inside stripe dashboard
    icon: Icons.calendar_full({ className: 'mb-3 h-20 w-20' }),
  },
}
