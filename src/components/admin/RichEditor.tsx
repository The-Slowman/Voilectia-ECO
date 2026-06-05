'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface RichEditorProps {
  value:    string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichEditor({ value, onChange, placeholder = 'Commencez à écrire...' }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[300px] outline-none rich-content text-sm p-4',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  const BTN = (props: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
    <button
      type="button"
      onClick={props.onClick}
      title={props.title}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        props.active
          ? 'bg-[rgba(82,183,136,0.2)] text-[#52B788]'
          : 'text-[#9DC4AD] hover:bg-[rgba(82,183,136,0.08)] hover:text-[#E8F5EE]'
      )}
    >
      {props.children}
    </button>
  )

  function addLink() {
    const url = window.prompt('URL du lien:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  function addImage() {
    const url = window.prompt('URL de l\'image:')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  if (!editor) return null

  return (
    <div className="border border-[rgba(82,183,136,0.2)] rounded-xl overflow-hidden bg-[#0C1F14] focus-within:border-[#52B788] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[rgba(82,183,136,0.1)] bg-[#111F18]">
        <BTN onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras">
          <Bold size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique">
          <Italic size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné">
          <UnderlineIcon size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré">
          <Strikethrough size={14} />
        </BTN>

        <div className="w-px h-4 bg-[rgba(82,183,136,0.15)] mx-1" />

        <BTN onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre 2">
          <Heading2 size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre 3">
          <Heading3 size={14} />
        </BTN>

        <div className="w-px h-4 bg-[rgba(82,183,136,0.15)] mx-1" />

        <BTN onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste">
          <List size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">
          <Quote size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <Code size={14} />
        </BTN>

        <div className="w-px h-4 bg-[rgba(82,183,136,0.15)] mx-1" />

        <BTN onClick={addLink} active={editor.isActive('link')} title="Lien">
          <LinkIcon size={14} />
        </BTN>
        <BTN onClick={addImage} title="Image">
          <ImageIcon size={14} />
        </BTN>
        <BTN onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">
          <Minus size={14} />
        </BTN>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
