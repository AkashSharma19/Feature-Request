import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, Image as ImageIcon, 
  Heading1, Heading2, Quote, Undo, Redo, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { uploadFile } from '../../lib/storage';

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-all hover:bg-gray-100 text-gray-500",
      isActive && "bg-teal-50 text-teal-600 hover:bg-teal-100",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true, // Keep fallback support
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-4 py-3',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setUploading(true);
          const url = await uploadFile(file, 'editor-images');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
          alert("Failed to upload image. Please check your Firebase configuration.");
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };


  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-teal-300 focus-within:ring-1 focus-within:ring-teal-500/10 transition-all">
      <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-gray-100 bg-gray-50/50">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </MenuButton>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </MenuButton>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </MenuButton>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={16} />
        </MenuButton>
        <MenuButton
          onClick={addImage}
          disabled={uploading}
          title={uploading ? "Uploading..." : "Insert Image"}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </MenuButton>
        <div className="ml-auto flex items-center">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={16} />
          </MenuButton>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
