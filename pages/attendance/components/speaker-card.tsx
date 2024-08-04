import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchGuestSpeaker } from '@/lib/api-requests'
import { Member } from '@/types/database-schemas'
import { useEffect, useState } from 'react'

export function SpeakerCard() {
  const [guestSpeaker, setGuestSpeaker] = useState<Partial<Member>>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function getStockPitchInfo() {
      const member = await fetchGuestSpeaker()
      if (member) {
        setGuestSpeaker(member)
      }

      setIsLoading(false)
    }

    getStockPitchInfo()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Speaker</CardTitle>
        <CardDescription>
          Introducing our guest speaker for today.
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-6'>
        <div className='flex flex-col items-center text-center justify-between'>
          <Avatar>
            <AvatarImage src='/avatars/01.png' />
            <AvatarFallback>
              {!isLoading &&
                guestSpeaker!.first_name![0] + guestSpeaker!.last_name![0]}
            </AvatarFallback>
          </Avatar>
          <div className='flex items-center space-x-4 p-6 py-4'>
            <div>
              <p className='text-base font-medium leading-none'>
                {!isLoading && guestSpeaker!.full_name}
              </p>
              <p className='text-sm text-muted-foreground'>
                {!isLoading && guestSpeaker!.email}
              </p>
            </div>
          </div>
          <p className='text-sm text-muted-foreground ml-0'>
            {!isLoading && guestSpeaker!.bio}
          </p>
        </div>

        {/* <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Owner{" "}
                <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Select new role..." />
                <CommandList>
                  <CommandEmpty>No roles found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Viewer</p>
                      <p className="text-sm text-muted-foreground">
                        Can view and comment.
                      </p>
                    </CommandItem>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Developer</p>
                      <p className="text-sm text-muted-foreground">
                        Can view, comment and edit.
                      </p>
                    </CommandItem>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Billing</p>
                      <p className="text-sm text-muted-foreground">
                        Can view, comment and manage billing.
                      </p>
                    </CommandItem>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Owner</p>
                      <p className="text-sm text-muted-foreground">
                        Admin-level access to all resources.
                      </p>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover> */}

        {/* <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Member{" "}
                <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
              <Command>
                <CommandInput placeholder="Select new role..." />
                <CommandList>
                  <CommandEmpty>No roles found.</CommandEmpty>
                  <CommandGroup className="p-1.5">
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Viewer</p>
                      <p className="text-sm text-muted-foreground">
                        Can view and comment.
                      </p>
                    </CommandItem>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Developer</p>
                      <p className="text-sm text-muted-foreground">
                        Can view, comment and edit.
                      </p>
                    </CommandItem>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Billing</p>
                      <p className="text-sm text-muted-foreground">
                        Can view, comment and manage billing.
                      </p>
                    </CommandItem>
                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                      <p>Owner</p>
                      <p className="text-sm text-muted-foreground">
                        Admin-level access to all resources.
                      </p>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover> */}
        {/* <SocialBar/> */}
      </CardContent>
    </Card>
  )
}
