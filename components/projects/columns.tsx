'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Database } from '@/database.types';
import { deleteProject } from '@/app/projects/actions/delete-project';
import Link from 'next/link';

type Project = Database['public']['Tables']['projects']['Row'];

export const columns = ({
  onDelete,
}: {
  onDelete: (projectId: string, projectTitle: string) => void;
}): ColumnDef<Project>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 1000,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <Link 
          href={`/projects/${project.id}`}
          className="hover:text-blue-600 transition-colors"
        >
          {project.title}
        </Link>
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
      const project = row.original;

      return (
        <>
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
              
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                variant="destructive"
                onClick={() => {
                  onDelete(project.id, project.title);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
