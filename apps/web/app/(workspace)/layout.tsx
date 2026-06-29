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
import styles from './workspace.module.css'

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
      <div className={styles.workspaceLoading}>
        Verifying session...
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className={styles.workspaceShell}>
      {/* Mobile menu trigger */}
      <button 
        onClick={handleToggleSidebar}
        className={styles.workspaceMobileToggle}
      >
        {sidebarOpen ? <X className={styles.workspaceMobileToggleIcon} /> : <Menu className={styles.workspaceMobileToggleIcon} />}
      </button>

      {/* Sidebar */}
      <aside className={[
        styles.workspaceSidebar,
        sidebarOpen ? styles.workspaceSidebarOpen : styles.workspaceSidebarClosed,
      ].join(' ')}>
        <div className={styles.workspaceSidebarInner}>
          {/* Logo */}
          <div className={styles.workspaceLogoRow}>
            <div className={styles.workspaceBrandRow}>
              <div className={styles.workspaceBrandMark}>
                O
              </div>
              <div>
                <h1 className={styles.workspaceBrandTitle}>Orma</h1>
                <span className={styles.workspaceBrandSubtitle}>Stay curious</span>
              </div>
            </div>
            <button 
              onClick={handleToggleSidebar}
              className={styles.workspaceSidebarDesktopToggle}
            >
              <Menu className={styles.workspaceMainToggleIcon} />
            </button>
          </div>

          {/* New Note Button */}
          <button 
            onClick={handleCreateNote}
            className={styles.workspaceSidebarButton}
          >
            <Plus className={styles.workspaceMainToggleIcon} />
            <span>New Note</span>
          </button>

          {/* Navigation */}
          <nav className={styles.workspaceSidebarNav}>
            <Link 
              href="/notes" 
              className={[
                styles.workspaceNavLink,
                pathname.startsWith('/notes') ? styles.workspaceNavLinkActive : styles.workspaceNavLinkInactive,
              ].join(' ')}
            >
              <FolderClosed className={styles.workspaceNavIcon} />
              <span>My Notes</span>
            </Link>
            <Link 
              href="/study" 
              className={[
                styles.workspaceNavLink,
                pathname.startsWith('/study') ? styles.workspaceNavLinkActive : styles.workspaceNavLinkInactive,
              ].join(' ')}
            >
              <FileText className={styles.workspaceNavIcon} />
              <span>Study</span>
            </Link>
            <Link 
              href="/daily-review" 
              className={[
                styles.workspaceNavLink,
                pathname.startsWith('/daily-review') ? styles.workspaceNavLinkActive : styles.workspaceNavLinkInactive,
              ].join(' ')}
            >
              <Clock className={styles.workspaceNavIcon} />
              <span>Daily Review</span>
            </Link>
            <Link 
              href="/library" 
              className={[
                styles.workspaceNavLink,
                pathname.startsWith('/library') ? styles.workspaceNavLinkActive : styles.workspaceNavLinkInactive,
              ].join(' ')}
            >
              <BookOpen className={styles.workspaceNavIcon} />
              <span>Library</span>
            </Link>
            <Link 
              href="/settings" 
              className={[
                styles.workspaceNavLink,
                pathname.startsWith('/settings') ? styles.workspaceNavLinkActive : styles.workspaceNavLinkInactive,
              ].join(' ')}
            >
              <Settings className={styles.workspaceNavIcon} />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Notebooks List */}
          <div className={styles.workspaceNotebookSection}>
            <div className={styles.workspaceSectionLabel}>Notebooks</div>
            {loadingNotebooks ? (
              <div className={styles.workspaceSectionLabel}>Loading notebooks...</div>
            ) : (
              <div className={styles.workspaceNotebookList}>
                {notebooks.map((nb: Notebook) => (
                  <button 
                    key={nb.id}
                    className={styles.workspaceNotebookItem}
                    onClick={() => router.push(`/notes?notebook_id=${nb.id}`)}
                  >
                    <div className={styles.workspaceNotebookTitle}>
                      <span>{nb.emoji || '📁'}</span>
                      <span className={styles.workspaceNotebookText}>{nb.title}</span>
                    </div>
                    <ChevronRight className={styles.workspaceNavIcon} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User profile */}
        <div className={styles.workspaceSidebarFooter}>
          <div className={styles.workspaceUserRow}>
            <div className={styles.workspaceUserAvatar}>
              <User className={styles.workspaceMainToggleIcon} />
            </div>
            <div className={styles.workspaceUserMeta}>
              <span className={styles.workspaceUserEmail}>{currentUser?.email}</span>
              <span className={styles.workspaceUserLabel}>User Session</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className={styles.workspaceLogoutButton}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.workspaceMain}>
        {/* Desktop floating toggle button when sidebar is collapsed */}
        {!sidebarOpen && isMounted && (
          <button 
            onClick={handleToggleSidebar}
            className={styles.workspaceMainToggle}
          >
            <Menu className={styles.workspaceMainToggleIcon} />
          </button>
        )}
        {children}
      </main>
    </div>
  )
}
