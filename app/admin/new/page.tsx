'use client'

import Link from 'next/link'
import ProjectForm from '../components/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
          <Link href="/admin" className="text-[#6b7280] hover:text-[#111827]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-extrabold text-[#111827] text-sm flex-1">Add New Project</h1>
          <button
            form="pf"
            type="submit"
            className="bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            Create Project
          </button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ProjectForm />
      </div>
    </div>
  )
}
