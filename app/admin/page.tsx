'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  slug: string
  locality: string
  status: string
  featured: boolean
  show_on_site: boolean
  display_price?: string
  configs?: { type: string }[]
}

const STATUS_LABEL: Record<string, string> = {
  new_launch: 'New Launch',
  under_construction: 'Under Construction',
  ready_to_move: 'Ready to Move',
}

const STATUS_COLOR: Record<string, string> = {
  new_launch: 'bg-green-100 text-green-700',
  under_construction: 'bg-yellow-100 text-yellow-700',
  ready_to_move: 'bg-blue-100 text-blue-700',
}

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProjects = useCallback(async (password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', {
        headers: { 'x-admin-key': password },
      })
      if (res.status === 401) {
        setAuthed(false)
        localStorage.removeItem('admin_pw')
        return
      }
      setProjects(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('admin_pw')
    if (stored) { setAuthed(true); setPw(stored); fetchProjects(stored) }
  }, [fetchProjects])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!pw.trim()) { setAuthError('Enter password'); return }
    localStorage.setItem('admin_pw', pw)
    setAuthError('')
    setAuthed(true)
    fetchProjects(pw)
  }

  async function handleDelete(id: string) {
    const password = localStorage.getItem('admin_pw') ?? ''
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': password },
    })
    if (res.ok) { setProjects((p) => p.filter((x) => x.id !== id)); showToast('Deleted') }
    else showToast('Delete failed', 'err')
    setDeleteId(null)
  }

  async function toggleField(id: string, field: 'featured' | 'show_on_site', current: boolean) {
    const password = localStorage.getItem('admin_pw') ?? ''
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': password },
      body: JSON.stringify({ [field]: !current }),
    })
    if (res.ok) {
      setProjects((p) => p.map((x) => x.id === id ? { ...x, [field]: !current } : x))
      showToast(`${field === 'featured' ? 'Featured' : 'Visibility'} updated`)
    } else {
      showToast('Update failed', 'err')
    }
  }

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.locality ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#1a56db] rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-[#111827]">ShowFlat.in Admin</h1>
            <p className="text-sm text-[#6b7280] mt-1">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Admin password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
              autoFocus
            />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button type="submit"
              className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all ${
          toast.type === 'err' ? 'bg-red-500' : 'bg-[#111827]'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#1a56db] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">SF</span>
            </div>
            <span className="font-extrabold text-[#111827] text-sm">ShowFlat Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-xs text-[#6b7280] hover:text-[#111827]">View Site ↗</Link>
            <button
              onClick={() => { localStorage.removeItem('admin_pw'); setAuthed(false) }}
              className="text-xs text-[#6b7280] hover:text-red-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111827]">Projects</h1>
            <p className="text-sm text-[#6b7280]">{projects.length} in Supabase</p>
          </div>
          <div className="sm:ml-auto flex gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
            />
            <Link
              href="/admin/new"
              className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new project
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[#6b7280] text-sm">
                {search ? 'No matches.' : 'No projects yet — add your first one!'}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280]">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] hidden sm:table-cell">Configs</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] hidden md:table-cell">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280]">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280]">Featured</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280]">Live</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#111827]">{p.name}</p>
                        <p className="text-xs text-[#6b7280]">{p.locality}</p>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280] hidden sm:table-cell text-xs">
                        {p.configs?.map((c) => c.type).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280] hidden md:table-cell text-xs">
                        {p.display_price || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-[#6b7280]'}`}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                      {/* Featured toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleField(p.id, 'featured', p.featured)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${p.featured ? 'bg-[#1a56db]' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.featured ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                        </button>
                      </td>
                      {/* Live toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleField(p.id, 'show_on_site', p.show_on_site)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${p.show_on_site ? 'bg-[#16a34a]' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.show_on_site ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 justify-end">
                          <Link href={`/admin/projects/${p.id}`}
                            className="text-xs font-semibold text-[#1a56db] hover:underline">
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-extrabold text-[#111827] mb-2">Delete project?</h3>
            <p className="text-sm text-[#6b7280] mb-5">
              This will permanently remove the project from Supabase.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-[#374151] font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
