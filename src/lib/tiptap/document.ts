import { z } from 'zod'

const allowedNodeTypes = new Set([
  'doc',
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'photoGroup',
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

export type PhotoGroupItem = {
  mediaId: string
  span: 2 | 3 | 4 | 6
  ratio: 'natural'
  caption?: string
}

export type PhotoGroupAttrs = {
  items: PhotoGroupItem[]
}

const photoGroupAttrsSchema = z.object({
  items: z.array(z.object({
    mediaId: z.uuid(),
    span: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(6)]),
    ratio: z.literal('natural'),
    caption: z.string().trim().max(500).optional(),
  }).strict()).min(1).max(6),
}).strict()

export const parsePhotoGroupAttrs = (value: unknown): PhotoGroupAttrs | null => {
  const result = photoGroupAttrsSchema.safeParse(value)

  return result.success ? result.data : null
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

const hasValidPhotoGroups = (node: TiptapNode): boolean => {
  if (node.type === 'photoGroup') {
    return (
      parsePhotoGroupAttrs(node.attrs) !== null &&
      !node.content?.length &&
      !node.marks?.length &&
      !node.text
    )
  }

  return (node.content ?? []).every(hasValidPhotoGroups)
}

export const parseTiptapDocument = (value: unknown): TiptapDocument | null => {
  const result = rawNodeSchema.safeParse(value)

  if (
    !result.success ||
    result.data.type !== 'doc' ||
    !result.data.content ||
    !hasSafeLinks(result.data) ||
    !hasValidPhotoGroups(result.data)
  ) {
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

export const getTiptapMediaIds = (document: TiptapDocument) => {
  const mediaIds = new Set<string>()

  const visitNode = (node: TiptapNode) => {
    if (node.type === 'photoGroup') {
      const attrs = parsePhotoGroupAttrs(node.attrs)

      attrs?.items.forEach(({ mediaId }) => mediaIds.add(mediaId))
    }

    node.content?.forEach(visitNode)
  }

  visitNode(document)

  return [...mediaIds]
}
