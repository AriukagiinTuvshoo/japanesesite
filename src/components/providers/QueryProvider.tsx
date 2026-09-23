// ============================================================
// Providers
// ============================================================

// QueryProvider — TanStack Query
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:   5 * 60 * 1000,  // 5 min
        gcTime:      10 * 60 * 1000, // 10 min
        retry:       2,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
