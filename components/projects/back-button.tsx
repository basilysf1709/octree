"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function BackButton() {
  return (
    <Button variant="ghost" size="sm" asChild className="h-7 px-2">
      <Link href="/" className="flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" />
        <span className="hidden sm:inline text-xs">Back to Projects</span>
        <span className="sm:hidden text-xs">Back</span>
      </Link>
    </Button>
  )
}
