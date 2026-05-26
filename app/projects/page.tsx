import type { Metadata } from 'next'
import Navbar from '@/app/components/Navbar'
import ProjectsClient from './ProjectsClient'
import { getProjects } from '@/lib/projects'

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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ budget?: string }>
}) {
  const projects = await getProjects()
  const { budget } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProjectsClient projects={projects} initialBudget={budget} />
    </div>
  )
}
