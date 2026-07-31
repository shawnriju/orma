'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shellStyles } from './_components/styles'
import MobileMenuTrigger from './_components/MobileMenuTrigger'
import Sidebar from './_components/Sidebar'
import MainContent from './_components/MainContent'

const queryClient = new QueryClient()

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>{children}</AppShell>
    </QueryClientProvider>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
      } else {
        setCurrentUser(session.user)
      }
      setAuthLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCurrentUser(null)
        router.push('/login')
      } else {
        setCurrentUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    setIsMounted(true)
    const savedState = localStorage.getItem('orma_sidebarOpen')
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState))
    }
  }, [])

  const handleToggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    localStorage.setItem('orma_sidebarOpen', JSON.stringify(newState))
  }

  // Fetch notebooks
  const { data: notebooks = [], isLoading: loadingNotebooks } = useQuery({
    queryKey: ['notebooks'],
    queryFn: () => api.notebooks.list(),
    enabled: !!currentUser
  })

  // Create notebook mutation
  const createNotebookMutation = useMutation({
    mutationFn: (title: string) => api.notebooks.create({ title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
    }
  })

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (notebookId: string) => api.notes.create({ notebook_id: notebookId, title: 'Untitled Note' }),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push(`/notes/${newNote.id}`)
    }
  })

  const handleCreateNote = () => {
    if (notebooks.length > 0) {
      createNoteMutation.mutate(notebooks[0].id)
    } else {
      createNotebookMutation.mutate('My Notebook', {
        onSuccess: (newNotebook) => {
          createNoteMutation.mutate(newNotebook.id)
        }
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <div className={shellStyles.authLoadingContainer}>
        Verifying session...
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className={shellStyles.wrapper}>
      <MobileMenuTrigger sidebarOpen={sidebarOpen} onToggle={handleToggleSidebar} />

      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        pathname={pathname}
        onCreateNote={handleCreateNote}
        notebooks={notebooks}
        loadingNotebooks={loadingNotebooks}
        onSelectNotebook={(notebookId) => router.push(`/notes?notebook_id=${notebookId}`)}
        userEmail={currentUser?.email}
        onLogout={handleLogout}
      />

      <MainContent sidebarOpen={sidebarOpen} isMounted={isMounted} onToggleSidebar={handleToggleSidebar}>
        {children}
      </MainContent>
    </div>
  )
}
