import { Icons } from '@/components/shared/icons'

export const membershipConfig = {
  fall: {
    price_id: 'price_1MoF6qKMISeWWjOmvQtEcz6q',
    display_price: 45, // change actual price inside stripe dashboard
    iconType: Icons.calendar_half,
    iconClass: 'mb-3 h-20 w-20',
    start_date: new Date('06/01/2000'),
    end_date: new Date('12/21/2000'),
  },
  spring: {
    price_id: 'price_1MoF7BKMISeWWjOmkW5lNbpe',
    display_price: 45, // change actual price inside stripe dashboard
    iconType: Icons.calendar_half,
    iconClass: 'mb-3 h-20 w-20',
    start_date: new Date('01/01/2000'),
    end_date: new Date('05/31/2000'),
  },
  year: {
    price_id: 'price_1MoF6XKMISeWWjOmLrqiyiHF',
    display_price: 80, // change actual price inside stripe dashboard
    iconType: Icons.calendar_full,
    iconClass: 'mb-3 h-20 w-20',
    start_date: new Date('06/01/2000'), // include summer months to ensure payments carry over to next year (ignore the abitrary year value)
    end_date: new Date('05/31/2000'),
  },
}

export const subscriptionPeriodConfig = {}
