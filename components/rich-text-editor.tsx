'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Italic, List, ListOrdered } from 'lucide-react';

export function RichTextEditor({ name, defaultValue, onDirty }: { name: string; defaultValue?: string; onDirty?: () => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue || '',
    immediatelyRender: false,
    onUpdate: () => onDirty?.(),
  });

  if (!editor) return <div className="rte rte-loading">Loading editor…</div>;

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" aria-label="Bold" className={editor.isActive('bold') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></button>
        <button type="button" aria-label="Italic" className={editor.isActive('italic') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></button>
        <button type="button" aria-label="Heading" className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></button>
        <button type="button" aria-label="Bullet list" className={editor.isActive('bulletList') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></button>
        <button type="button" aria-label="Numbered list" className={editor.isActive('orderedList') ? 'is-active' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></button>
      </div>
      <EditorContent editor={editor} className="rte-content" />
      <input type="hidden" name={name} value={editor.getHTML()} readOnly />
    </div>
  );
}
