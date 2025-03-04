'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-red-500">
          <h2>Something went wrong</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
} 