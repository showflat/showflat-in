import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Navbar from '@/app/components/Navbar'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'New Launch Projects in Pune | ShowFlat.in — Zero Brokerage',
  description:
    'Browse 6 RERA verified new launch apartments in Pune. Filter by budget, BHK, locality and possession date. Zero brokerage channel partner.',
  openGraph: {
    title: 'New Launch Projects in Pune | ShowFlat.in',
    description: 'Browse RERA verified new launches. Zero brokerage.',
    type: 'website',
  },
}

export default function ProjectsPage() {
  const projects = JSON.parse(
    readFileSync(join(process.cwd(), 'data/projects.json'), 'utf-8')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProjectsClient projects={projects} />
    </div>
  )
}
