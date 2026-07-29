'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Clock, 
  FolderClosed, 
  Settings, 
  Plus, 
  ChevronRight, 
  Menu, 
  X,
  FileText,
  User
} from 'lucide-react'
import { api, Notebook, Note } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
      <div className="min-h-screen flex items-center justify-center bg-surface text-outline text-sm">
        Verifying session...
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex h-screen bg-surface text-on-surface overflow-hidden font-body-md">
      {/* Mobile menu trigger */}
      <button 
        onClick={handleToggleSidebar}
        className="fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 bg-white border border-outline-variant rounded-lg shadow-sm hover:bg-surface-container-low transition-colors md:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
      </button>

      {/* Sidebar */}
      <aside className={[
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between p-6 bg-surface border-r border-outline-variant/50 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      ].join(' ')}>
        <div className="flex flex-col gap-8 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-sm font-semibold">
                O
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight tracking-tight text-primary">Orma</h1>
                <span className="text-xs font-medium text-outline">Stay curious</span>
              </div>
            </div>
            <button 
              onClick={handleToggleSidebar}
              className="hidden md:inline-flex p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-primary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* New Note Button */}
          <button 
            onClick={handleCreateNote}
            className="flex items-center justify-center gap-2 w-full p-3 bg-primary-container text-white font-medium rounded-2xl shadow-sm hover:bg-primary hover:-translate-y-px transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Note</span>
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <Link 
              href="/notes" 
              className={[
                "flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-colors",
                pathname.startsWith('/notes') ? "bg-secondary-fixed text-on-secondary-fixed" : "text-on-surface-variant hover:bg-surface-container",
              ].join(' ')}
            >
              <FolderClosed className="w-5 h-5" />
              <span>My Notes</span>
            </Link>
            <Link 
              href="/study" 
              className={[
                "flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-colors",
                pathname.startsWith('/study') ? "bg-secondary-fixed text-on-secondary-fixed" : "text-on-surface-variant hover:bg-surface-container",
              ].join(' ')}
            >
              <FileText className="w-5 h-5" />
              <span>Study</span>
            </Link>
            <Link 
              href="/daily-review" 
              className={[
                "flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-colors",
                pathname.startsWith('/daily-review') ? "bg-secondary-fixed text-on-secondary-fixed" : "text-on-surface-variant hover:bg-surface-container",
              ].join(' ')}
            >
              <Clock className="w-5 h-5" />
              <span>Daily Review</span>
            </Link>
            <Link 
              href="/library" 
              className={[
                "flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-colors",
                pathname.startsWith('/library') ? "bg-secondary-fixed text-on-secondary-fixed" : "text-on-surface-variant hover:bg-surface-container",
              ].join(' ')}
            >
              <BookOpen className="w-5 h-5" />
              <span>Library</span>
            </Link>
            <Link 
              href="/settings" 
              className={[
                "flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-colors",
                pathname.startsWith('/settings') ? "bg-secondary-fixed text-on-secondary-fixed" : "text-on-surface-variant hover:bg-surface-container",
              ].join(' ')}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Notebooks List */}
          <div className="flex flex-col gap-2">
            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-outline">Notebooks</div>
            {loadingNotebooks ? (
              <div className="px-4 text-xs font-semibold uppercase tracking-wider text-outline">Loading notebooks...</div>
            ) : (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {notebooks.map((nb: Notebook) => (
                  <button 
                    key={nb.id}
                    className="flex items-center justify-between py-2 px-4 rounded-xl text-left text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
                    onClick={() => router.push(`/notes?notebook_id=${nb.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{nb.emoji || '📁'}</span>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{nb.title}</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User profile */}
        <div className="pt-4 border-t border-outline-variant/40 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center text-primary font-semibold border border-outline-variant shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface overflow-hidden text-ellipsis whitespace-nowrap">{currentUser?.email}</span>
              <span className="text-[10px] font-medium text-outline">User Session</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-error text-left hover:bg-error-container/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={[
        "relative flex-1 flex flex-col overflow-hidden bg-white transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "ml-0"
      ].join(' ')}>
        {/* Desktop floating toggle button when sidebar is collapsed */}
        {!sidebarOpen && isMounted && (
          <button 
            onClick={handleToggleSidebar}
            className="absolute top-4 left-4 z-30 hidden md:inline-flex p-2 bg-white border border-outline-variant/50 rounded-lg shadow-sm text-outline hover:bg-surface-container-low hover:text-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {children}
      </main>
    </div>
  )
}
