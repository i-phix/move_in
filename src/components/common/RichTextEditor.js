import React, { useEffect, useRef } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading2, Heading3, Italic,
  List, ListOrdered, Quote, RemoveFormatting, Underline,
} from 'lucide-react';
import { normalizeRichText, sanitizeRichText } from '../../utils/richText';

const TOOLS = [
  { command: 'bold', label: 'Bold', icon: Bold },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'underline', label: 'Underline', icon: Underline },
  { command: 'formatBlock', value: 'h2', label: 'Large heading', icon: Heading2 },
  { command: 'formatBlock', value: 'h3', label: 'Heading', icon: Heading3 },
  { command: 'insertUnorderedList', label: 'Bulleted list', icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered },
  { command: 'formatBlock', value: 'blockquote', label: 'Quote', icon: Quote },
  { command: 'justifyLeft', label: 'Align left', icon: AlignLeft },
  { command: 'justifyCenter', label: 'Align center', icon: AlignCenter },
  { command: 'justifyRight', label: 'Align right', icon: AlignRight },
  { command: 'removeFormat', label: 'Clear formatting', icon: RemoveFormatting },
];

function RichTextEditor({
  id,
  name,
  value,
  onChange,
  placeholder = 'Add a clear, helpful description...',
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const html = normalizeRichText(value);
    if (editor.innerHTML !== html) editor.innerHTML = html;
  }, [value]);

  const emitChange = () => {
    onChange({
      target: {
        name,
        value: sanitizeRichText(editorRef.current?.innerHTML || ''),
      },
    });
  };

  const applyCommand = (tool) => {
    editorRef.current?.focus();
    document.execCommand(tool.command, false, tool.value || null);
    emitChange();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    emitChange();
  };

  return (
    <div className="mi-rich-editor">
      <div className="mi-rich-toolbar" aria-label="Description formatting controls">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={`${tool.command}-${tool.value || ''}`}
              type="button"
              className="mi-rich-tool"
              title={tool.label}
              aria-label={tool.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyCommand(tool)}
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>
      <div
        id={id}
        ref={editorRef}
        className="mi-rich-input"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default RichTextEditor;
