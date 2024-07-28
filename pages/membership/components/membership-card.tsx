import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { membershipConfig } from '@/config/membership'

interface MemberCardProps {
  semester: 'fall' | 'spring' | 'year'
}

export function MembershipCard({ semester }: MemberCardProps) {
  const IconComponent = membershipConfig[semester].iconType

  return (
    <Card className='text-center'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl capitalize'>
          {semester} Membership
        </CardTitle>
        <CardDescription>
          Purchase membership for the {semester}.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <Label className='flex flex-col space-y-1 items-center'>
          <IconComponent className={membershipConfig[semester].iconClass} />
          {/* Normally like this <Icons.calendar_half className='mb-3 h-20 w-20' /> */}
          <div className='text-4xl font-bold py-5'>
            ${membershipConfig[semester].display_price}
          </div>
        </Label>
        <Button>Purchase</Button>
      </CardContent>
    </Card>
  )
}

// Popup for confirmation, then run this method
// function stripeCheckout(priceId: string, email: string) {
//   // axios.post('/api/stripe/checkout_sessions', {priceId, email})
// }
