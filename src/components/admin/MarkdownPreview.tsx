'use client';

import React from 'react';

/**
 * Minimalist markdown renderer (no external libs).
 * Supports: headings (# / ## / ###), **bold**, *italic*,
 * inline `code`, [text](url) links, unordered lists (- item),
 * and paragraph separation via blank lines.
 */
export default function MarkdownPreview({ value }: { value: string }) {
  const html = renderMarkdown(value ?? '');
  if (!value || value.trim() === '') {
    return (
      <div className="min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm italic">
        Нет содержимого для превью
      </div>
    );
  }
  return (
    <div
      className="min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm prose-sm max-w-none [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_li]:my-0.5 [&_p]:my-2 [&_a]:text-teal-700 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-[0.85em]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(s: string): string {
  let out = escapeHtml(s);
  // inline code (backticks) — done before other transforms to protect content
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold **...**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *...*  (single *)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return out;
}

function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inList = false;
  let paraBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length > 0) {
      out.push('<p>' + renderInline(paraBuf.join(' ')) + '</p>');
      paraBuf = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === '') {
      flushPara();
      closeList();
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h1 = line.match(/^#\s+(.+)$/);
    const li = line.match(/^\s*-\s+(.+)$/);
    if (h1) {
      flushPara(); closeList();
      out.push('<h1>' + renderInline(h1[1]) + '</h1>');
    } else if (h2) {
      flushPara(); closeList();
      out.push('<h2>' + renderInline(h2[1]) + '</h2>');
    } else if (h3) {
      flushPara(); closeList();
      out.push('<h3>' + renderInline(h3[1]) + '</h3>');
    } else if (li) {
      flushPara();
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push('<li>' + renderInline(li[1]) + '</li>');
    } else {
      closeList();
      paraBuf.push(line);
    }
  }
  flushPara();
  closeList();
  return out.join('\n');
}
