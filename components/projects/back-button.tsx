"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function BackButton() {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/projects" className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Projects</span>
        <span className="sm:hidden">Back</span>
      </Link>
    </Button>
  )
}
