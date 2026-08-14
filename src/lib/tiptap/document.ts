import { z } from 'zod'

const allowedNodeTypes = new Set([
  'doc',
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'hardBreak',
  'text',
])

const allowedMarkTypes = new Set(['bold', 'italic', 'link'])
const allowedLinkProtocols = new Set(['http:', 'https:', 'mailto:'])

export type TiptapMark = {
  type: 'bold' | 'italic' | 'link'
  attrs?: {
    href?: string
    target?: string
    rel?: string
  }
}

export type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

export type TiptapDocument = TiptapNode & {
  type: 'doc'
  content: TiptapNode[]
}

const rawNodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.object({
    type: z.string().refine((type) => allowedNodeTypes.has(type)),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(rawNodeSchema).optional(),
    marks: z.array(z.object({
      type: z.enum(['bold', 'italic', 'link']),
      attrs: z.object({
        href: z.string().max(2048).optional(),
        target: z.string().optional(),
        rel: z.string().optional(),
      }).optional(),
    })).optional(),
    text: z.string().max(100_000).optional(),
  }),
)

const hasSafeLinks = (node: TiptapNode): boolean => {
  const marksAreSafe = (node.marks ?? []).every((mark) => {
    if (!allowedMarkTypes.has(mark.type) || mark.type !== 'link') return true

    const href = mark.attrs?.href
    if (!href) return false

    try {
      return allowedLinkProtocols.has(new URL(href).protocol)
    } catch {
      return false
    }
  })

  return marksAreSafe && (node.content ?? []).every(hasSafeLinks)
}

export const parseTiptapDocument = (value: unknown): TiptapDocument | null => {
  const result = rawNodeSchema.safeParse(value)

  if (!result.success || result.data.type !== 'doc' || !result.data.content || !hasSafeLinks(result.data)) {
    return null
  }

  return result.data as TiptapDocument
}

export const parseSerializedTiptapDocument = (value: string): TiptapDocument | null => {
  try {
    return parseTiptapDocument(JSON.parse(value))
  } catch {
    return null
  }
}

export const createDocumentFromPlainText = (plainText: string): TiptapDocument => ({
  type: 'doc',
  content: plainText.split('\n').map((line) => ({
    type: 'paragraph',
    ...(line ? { content: [{ type: 'text', text: line }] } : {}),
  })),
})

const getNodeText = (node: TiptapNode): string => {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'

  const separator = ['doc', 'blockquote', 'bulletList', 'orderedList', 'listItem'].includes(node.type) ? '\n' : ''
  return (node.content ?? []).map(getNodeText).join(separator)
}

export const getTiptapPlainText = (document: TiptapDocument) => getNodeText(document)
  .replace(/\n{3,}/g, '\n\n')
  .trim()
