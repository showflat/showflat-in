'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  slug: string
  locality: string
  status: string
  featured?: boolean
  showflatAvailable?: boolean
  priceRange?: { displayMin: string; displayMax: string }
  configs?: { type: string }[]
}

const STATUS_LABELS: Record<string, string> = {
  new_launch: 'New Launch',
  under_construction: 'Under Construction',
  ready_to_move: 'Ready to Move',
}

const STATUS_COLORS: Record<string, string> = {
  new_launch: 'bg-green-100 text-green-700',
  under_construction: 'bg-yellow-100 text-yellow-700',
  ready_to_move: 'bg-blue-100 text-blue-700',
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const storedPw =
    typeof window !== 'undefined' ? localStorage.getItem('admin_pw') ?? '' : ''

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProjects = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', {
        headers: { 'x-admin-password': pw },
      })
      if (res.status === 401) {
        setAuthed(false)
        localStorage.removeItem('admin_pw')
        return
      }
      const data = await res.json()
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (storedPw) {
      setAuthed(true)
      setPassword(storedPw)
      fetchProjects(storedPw)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // Quick check — real auth happens server-side on first fetch
    if (!password.trim()) { setAuthError('Enter password'); return }
    localStorage.setItem('admin_pw', password)
    setAuthError('')
    setAuthed(true)
    fetchProjects(password)
  }

  async function handleDelete(id: string) {
    const pw = localStorage.getItem('admin_pw') ?? ''
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': pw },
    })
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      showToast('Project deleted')
    } else {
      showToast('Delete failed')
    }
    setDeleteId(null)
  }

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.locality.toLowerCase().includes(search.toLowerCase())
  )

  // ── Login screen ────────────────────────────────────────────────────────────
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
            <h1 className="text-xl font-extrabold text-[#111827]">ShowFlat Admin</h1>
            <p className="text-sm text-[#6b7280] mt-1">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
              autoFocus
            />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#111827] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
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
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[#6b7280] hover:text-[#111827]">
              View Site
            </Link>
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
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111827]">Projects</h1>
            <p className="text-sm text-[#6b7280]">{projects.length} total</p>
          </div>
          <div className="sm:ml-auto flex gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or locality…"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
            />
            <Link
              href="/admin/projects/new"
              className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[#6b7280] text-sm">
                {search ? 'No projects match your search.' : 'No projects yet. Add your first one!'}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b7280] text-xs">Project</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b7280] text-xs hidden sm:table-cell">Configs</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b7280] text-xs hidden md:table-cell">Price Range</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b7280] text-xs">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#6b7280] text-xs hidden sm:table-cell">Flags</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#111827]">{p.name}</p>
                        <p className="text-xs text-[#6b7280]">{p.locality}</p>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280] hidden sm:table-cell">
                        {p.configs?.map((c) => c.type).join(', ') ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#6b7280] hidden md:table-cell">
                        {p.priceRange
                          ? `₹${p.priceRange.displayMin} – ₹${p.priceRange.displayMax}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-[#6b7280]'}`}>
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex gap-1.5">
                          {p.featured && (
                            <span className="text-xs bg-yellow-50 text-yellow-600 font-semibold px-2 py-0.5 rounded-full border border-yellow-100">Featured</span>
                          )}
                          {p.showflatAvailable && (
                            <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full border border-green-100">Showflat</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/admin/projects/${p.id}`}
                            className="text-xs font-semibold text-[#1a56db] hover:underline"
                          >
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-extrabold text-[#111827] mb-2">Delete project?</h3>
            <p className="text-sm text-[#6b7280] mb-5">
              This will permanently remove the project from data/projects.json.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-[#374151] font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
