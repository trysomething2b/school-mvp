"use client"

import { createContext, useContext, type ReactNode } from "react"

export type SessionUser = {
  id: string
  email: string | undefined
}

type SessionContextValue = {
  user: SessionUser | null
}

const SessionContext = createContext<SessionContextValue>({ user: null })

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null
  children: ReactNode
}) {
  return <SessionContext.Provider value={{ user }}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
