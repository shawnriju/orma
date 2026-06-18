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
      <div className="min-h-screen bg-[#fff8f5] flex items-center justify-center text-[#87736c] text-sm">
        Verifying session...
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#fff8f5] text-[#1e1b18] overflow-hidden font-sans">
      {/* Mobile menu trigger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#fff] border border-[#dac1b9] rounded-lg shadow-sm md:hidden hover:bg-[#fbf2ed] transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-[#94492c]" /> : <Menu className="w-5 h-5 text-[#94492c]" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#fff8f5] border-r border-[#dac1b9]/50 flex flex-col justify-between p-6 transition-transform duration-300 md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#94492c] to-[#d67d5c] flex items-center justify-center text-[#fff] shadow-sm font-semibold">
              O
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight tracking-tight text-[#94492c]">Orma</h1>
              <span className="text-xs text-[#87736c] font-medium font-sans">Stay curious</span>
            </div>
          </div>

          {/* New Note Button */}
          <button 
            onClick={handleCreateNote}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#d67d5c] hover:bg-[#94492c] text-[#fff] font-medium rounded-2xl shadow-sm transition-all duration-200 transform hover:-translate-y-[1px]"
          >
            <Plus className="w-5 h-5" />
            <span>New Note</span>
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <Link 
              href="/notes" 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                pathname.startsWith('/notes') 
                  ? 'bg-[#d3e8d1] text-[#0e1f11]' 
                  : 'hover:bg-[#f5ece7] text-[#54433d]'
              }`}
            >
              <FolderClosed className="w-5 h-5" />
              <span>My Notes</span>
            </Link>
            <Link 
              href="/study" 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                pathname.startsWith('/study') 
                  ? 'bg-[#d3e8d1] text-[#0e1f11]' 
                  : 'hover:bg-[#f5ece7] text-[#54433d]'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Daily Review</span>
            </Link>
            <Link 
              href="/library" 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                pathname.startsWith('/library') 
                  ? 'bg-[#d3e8d1] text-[#0e1f11]' 
                  : 'hover:bg-[#f5ece7] text-[#54433d]'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Library</span>
            </Link>
            <Link 
              href="/settings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                pathname.startsWith('/settings') 
                  ? 'bg-[#d3e8d1] text-[#0e1f11]' 
                  : 'hover:bg-[#f5ece7] text-[#54433d]'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Notebooks List */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#87736c] px-4">Notebooks</div>
            {loadingNotebooks ? (
              <div className="text-xs text-[#87736c] px-4">Loading notebooks...</div>
            ) : (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {notebooks.map((nb: Notebook) => (
                  <button 
                    key={nb.id}
                    className="flex items-center justify-between px-4 py-2 rounded-xl text-left text-sm text-[#54433d] hover:bg-[#f5ece7] transition-all font-medium"
                    onClick={() => router.push(`/notes?notebook_id=${nb.id}`)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{nb.emoji || '📁'}</span>
                      <span className="truncate">{nb.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User profile */}
        <div className="pt-4 border-t border-[#dac1b9]/40 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e9e1dc] overflow-hidden flex items-center justify-center text-[#94492c] font-semibold border border-[#dac1b9] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs truncate text-[#1e1b18]">{currentUser?.email}</span>
              <span className="text-[10px] font-medium text-[#87736c]">User Session</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#fff]">
        {children}
      </main>
    </div>
  )
}
