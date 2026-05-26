import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'projects.json')

function readProjects() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

function writeProjects(projects: unknown[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = readProjects()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = readProjects()
  const body = await req.json()

  // Generate slug from name if not provided
  if (!body.slug && body.name) {
    body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  if (!body.id) {
    body.id = body.slug
  }

  projects.push(body)
  writeProjects(projects)
  return NextResponse.json(body, { status: 201 })
}
