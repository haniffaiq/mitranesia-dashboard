import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Link2Off,
  Image as ImageIcon,
  Code,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

function ToolbarButton({
  active,
  onClick,
  title,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL link", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  const insertImage = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    editor.chain().focus().setImage({ src: dataUrl }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/40 px-2 py-1.5">
      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton active={editor.isActive("link")} onClick={setLink} title="Insert/edit link">
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetLink().run()}
        title="Remove link"
        disabled={!editor.isActive("link")}
      >
        <Link2Off className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        title="Insert image (inline base64)"
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = "";
        }}
      />
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
        disabled={!editor.can().undo()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (Ctrl+Shift+Z)"
        disabled={!editor.can().redo()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Tulis paragraf…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm max-w-none min-h-[140px] px-3 py-2 focus:outline-none [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_img]:rounded-lg [&_img]:my-2",
      },
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== "" && value !== "<p></p>") {
      editor.commands.setContent(value, { emitUpdate: false });
    } else if (value === "" && current !== "<p></p>" && current !== "") {
      editor.commands.clearContent(false);
    }
  }, [value, editor]);

  return (
    <div className={cn("rounded-md border border-border/60 bg-background", className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
