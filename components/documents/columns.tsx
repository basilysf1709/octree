'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { MoreHorizontal, Trash2, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Document } from '@/types/document';

type DocumentsTableProps = {
  onDelete: (docId: string, title: string) => void;
};

export const columns = ({
  onDelete,
}: DocumentsTableProps): ColumnDef<Document>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 600,
  },
  {
    accessorKey: 'project',
    header: 'Project',
    size: 200,
    cell: ({ row }) => {
      const document = row.original;
      
      if (document.projects) {
        return (
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-blue-500" />
            <span className="text-neutral-900">{document.projects.title}</span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-neutral-400" />
          <span className="text-neutral-500">No Project</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Last Updated',
    size: 200,
    cell: ({ row }) => {
      return dayjs(row.getValue('updated_at')).format('MMM D, YYYY h:mm A');
    },
  },
  {
    id: 'actions',
    size: 50,
    cell: ({ row }) => {
      const document = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={() => onDelete(document.id, document.title)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
