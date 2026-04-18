import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Formato inválido. Use PNG, JPG, SVG ou WebP.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'png'
  const filename = `logo.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const dest = path.join(process.cwd(), 'public', 'images', filename)
  await writeFile(dest, buffer)

  return NextResponse.json({ logoUrl: `/images/${filename}` })
}
