import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function MeetingInfoCard() {
  return (
    <Card>
      <CardHeader className='space-y-1 flex-row justify-between'>
        <CardTitle className='text-2xl'>Meeting Agenda</CardTitle>
        <CardDescription className='text-lg text-muted-foreground'>
          January 5th, 2024
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        {/* <div className="grid grid-cols-2 gap-6">
          <Button variant="outline">
            <Icons.gitHub className="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button variant="outline">
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div> */}
        {/* <Label className='flex flex-row items-baseline space-x-1'></Label> */}
        <div className='grid gap-1 pt-2'>
          <div className='flex items-center justify-between space-x-4'>
            <div className='flex items-center grid grid-cols-4 px-6 py-2'>
              {/* rounded-lg border bg-card text-card-foreground */}
              <p className='col-span-1 text-base font-medium leading-none'>
                Introduction
              </p>
              <p className='col-span-3 text-sm text-muted-foreground'>
                NVIDIA has established itself as a leader in the semiconductor
                industry, renowned for its cutting-edge graphics processing
                units (GPUs) and artificial intelligence (AI) technology. With
                the rapid expansion of AI, gaming, and data center markets,
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between space-x-4'>
            <div className='flex items-center grid grid-cols-4 px-6 py-2'>
              {/* rounded-lg border bg-card text-card-foreground */}
              <p className='col-span-1 text-base font-medium leading-none'>
                Guest Speaker
              </p>
              <p className='col-span-3 text-sm text-muted-foreground'>
                NVIDIA has established itself as a leader in the semiconductor
                industry, renowned for its cutting-edge graphics processing
                units (GPUs) and artificial intelligence (AI) technology. With
                the rapid expansion of AI, gaming, and data center
                markets,processing units (GPUs) and artificial intelligence (AI)
                technology. With the rapid expansion of AI, gaming, and data
                center markets,
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between space-x-4'>
            <div className='flex items-center grid grid-cols-4 px-6 py-2'>
              {/* rounded-lg border bg-card text-card-foreground */}
              <p className='col-span-1 text-base font-medium leading-none'>
                Stock Pitch
              </p>
              <p className='col-span-3 text-sm text-muted-foreground'>
                NVIDIA has established itself as a leader in the semiconductor
                industry, renowned for its cutting-edge graphics processing
                units (GPUs) and artificial intelligence (AI) technology. With
                the rapid expansion of AI, gaming, and data center
                markets,processing units (GPUs) and artificial intelligence (AI)
                technology. With the rapid expansion of AI, gaming, and data
                center markets,
              </p>
            </div>
          </div>

          {/* <Label className='flex flex-col space-y-1'>
            <span>Direction</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              Long
            </span>
          </Label>
          <Label className='flex flex-col space-y-1'>
            <span>Invested</span>
            <span className='font-normal leading-snug text-muted-foreground'>
              No
            </span>
          </Label> */}
        </div>
        {/* <Label className='flex flex-col space-y-1'>
          <span>Description</span>
          <span className='font-normal leading-snug text-muted-foreground'>
            NVIDIA has established itself as a leader in the semiconductor
            industry, renowned for its cutting-edge graphics processing units
            (GPUs) and artificial intelligence (AI) technology. With the rapid
            expansion of AI, gaming, and data center markets, NVIDIA&apos;s
            innovative products are in high demand. The company&apos;s strong
            financial performance, consistent revenue growth, and strategic
            acquisitions position it well for sustained long-term growth.
            Additionally, NVIDIA&apos;s advancements in autonomous vehicles and
            cloud computing further bolster its potential. Investing in a long
            position now could offer substantial returns as the company
            continues to capitalize on emerging technology trends.
          </span>
        </Label> */}
      </CardContent>
    </Card>
  )
}
