import { ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'
import { DataTableColumnHeader } from '@/components/common/data-table/data-table-column-header'
import { PositionDataTableRowActions } from './position-data-table-row-actions'

// Add new Database table?
const PositionSchema = z.object({
  name: z.string(),
  ticker: z.string(),
  direction: z.enum(['long', 'short', 'hold']),
  quantity: z.number(),
  current_price: z.number(),
  buy_price: z.number(),
  buy_in_date: z.string(),
  total_investment: z.number(),
  notes: z.string(),
  last_updated: z.string(),
})

const PositionCalculatedSchema = z.object({
  return: z.number(),
  percent_change: z.number(),
})

export const PositionWithCalculatedSchema = PositionSchema.merge(
  PositionCalculatedSchema
)
export type PositionWithCalculated = z.infer<
  typeof PositionWithCalculatedSchema
>

export const columns: ColumnDef<PositionWithCalculated>[] = [
  {
    accessorKey: 'last_updated',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Updated' />
    ),
  },
  {
    accessorKey: 'ticker',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ticker' />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Quantity' />
    ),
  },
  {
    accessorKey: 'buy_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Buy Price' />
    ),
  },
  {
    accessorKey: 'current_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Current Price' />
    ),
  },
  {
    accessorKey: 'total_investment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Investment' />
    ),
  },
  {
    accessorKey: 'return',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Return' />
    ),
  },
  {
    accessorKey: 'percent_change',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Percent Change' />
    ),
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
  },
  {
    id: 'actions',
    cell: ({ row }) => <PositionDataTableRowActions row={row} />,
  },

  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label='Select all'
  //       className='translate-y-[2px]'
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label='Select row'
  //       className='translate-y-[2px]'
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Task' />
  //   ),
  //   cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: 'title',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Title' />
  //   ),
  //   cell: ({ row }) => {
  //     const label = labels.find((label) => label.value === row.original.label)

  //     return (
  //       <div className='flex space-x-2'>
  //         {label && <Badge variant='outline'>{label.label}</Badge>}
  //         <span className='max-w-[500px] truncate font-medium'>
  //           {row.getValue('title')}
  //         </span>
  //       </div>
  //     )
  //   },
  // },
  // {
  //   accessorKey: 'status',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Status' />
  //   ),
  //   cell: ({ row }) => {
  //     const status = statuses.find(
  //       (status) => status.value === row.getValue('status')
  //     )

  //     if (!status) {
  //       return null
  //     }

  //     return (
  //       <div className='flex w-[100px] items-center'>
  //         {status.icon && (
  //           <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
  //         )}
  //         <span>{status.label}</span>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  // {
  //   accessorKey: 'priority',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Priority' />
  //   ),
  //   cell: ({ row }) => {
  //     const priority = priorities.find(
  //       (priority) => priority.value === row.getValue('priority')
  //     )

  //     if (!priority) {
  //       return null
  //     }

  //     return (
  //       <div className='flex items-center'>
  //         {priority.icon && (
  //           <priority.icon className='mr-2 h-4 w-4 text-muted-foreground' />
  //         )}
  //         <span>{priority.label}</span>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
]
