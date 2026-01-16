import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock environment variables for Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    return React.createElement('img', { src, alt, ...props })
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '',
}))
