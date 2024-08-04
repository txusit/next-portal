import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchPitchMembers } from '@/lib/api-requests'
import { Member } from '@/types/database-schemas'
import { useEffect, useState } from 'react'
// import { Label } from '@/components/ui/label'

export function TeamInfoCard() {
  const [pitchMembers, setPitchMembers] = useState<Partial<Member>[]>([])
  console.log('pitchMembers:', pitchMembers)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function getPitchMembers() {
      const members = await fetchPitchMembers()
      setPitchMembers(members)
      setIsLoading(false)
    }
    getPitchMembers()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pitch Team</CardTitle>
        <CardDescription>Members of today&apos;s pitch team.</CardDescription>
      </CardHeader>
      <CardContent className='grid gap-6'>
        {/* TODO: CLARIFY WITH EXEC */}
        {/* <Label className='flex flex-col space-y-1'>
          <span>Analyst Group</span>
          <span className='font-normal leading-snug text-muted-foreground'>
            Tech, Media, and Telecom
          </span>
        </Label> */}
        {/* <div className='flex items-center justify-between space-x-4'>
          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarImage src='/avatars/01.png' />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium leading-none'>Sofia Davis</p>
              <p className='text-sm text-muted-foreground'>m@example.com</p>
            </div>
          </div>
        </div> */}

        {!isLoading &&
          pitchMembers.map((member, index) => (
            <div
              key={index}
              className='flex items-center justify-between space-x-4'
            >
              <div className='flex items-center space-x-4'>
                <Avatar>
                  <AvatarImage src='/avatars/01.png' />
                  <AvatarFallback>
                    {member.first_name![0] + member.last_name![0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium leading-none'>
                    {member.full_name}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {member.email}
                  </p>
                </div>
              </div>
            </div>
          ))}

        {/* <div className='flex items-center justify-between space-x-4'>
          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarImage src='/avatars/01.png' />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium leading-none'>Sofia Davis</p>
              <p className='text-sm text-muted-foreground'>m@example.com</p>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between space-x-4'>
          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarImage src='/avatars/01.png' />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium leading-none'>Sofia Davis</p>
              <p className='text-sm text-muted-foreground'>m@example.com</p>
            </div>
          </div> */}
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
        {/* </div>
        <div className='flex items-center justify-between space-x-4'>
          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarImage src='/avatars/02.png' />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium leading-none'>Jackson Lee</p>
              <p className='text-sm text-muted-foreground'>p@example.com</p>
            </div>
          </div> */}
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
        {/* </div> */}
      </CardContent>
    </Card>
  )
}
