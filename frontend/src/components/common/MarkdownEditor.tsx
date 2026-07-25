import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, List, Code, Eye, Edit2 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    onChange(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className="w-full border border-slate-800 rounded-xl bg-slate-950 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-3 py-1.5 border-b border-slate-800 bg-slate-900/60 select-none">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isPreview}
            onClick={() => insertText('**', '**')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            disabled={isPreview}
            onClick={() => insertText('*', '*')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            disabled={isPreview}
            onClick={() => insertText('- ', '')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Bullet List"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            disabled={isPreview}
            onClick={() => insertText('```\n', '\n```')}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            title="Code Block"
          >
            <Code size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {isPreview ? (
            <>
              <Edit2 size={10} />
              Edit
            </>
          ) : (
            <>
              <Eye size={10} />
              Preview
            </>
          )}
        </button>
      </div>

      <div className="min-h-[100px] flex">
        {isPreview ? (
          <div className="p-3.5 text-xs text-left text-slate-300 leading-relaxed overflow-y-auto w-full prose prose-invert max-w-none">
            {value.trim() ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <span className="text-slate-600 italic select-none">Nothing to preview</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Type note details (Markdown supported)...'}
            rows={3}
            className="w-full p-3.5 bg-transparent border-0 text-slate-200 placeholder-slate-500 text-xs focus:ring-0 focus:outline-none resize-y"
          />
        )}
      </div>
    </div>
  );
};
