/**
 * Минималистичный markdown-рендер для AI-чата.
 * НЕ тащим react-markdown — поддерживаем только то, что реально присылает LLM:
 *   **жирный**, *курсив*, `inline code`, * списки, 1. списки,
 *   ## заголовки, --- horizontal rule, переводы строк.
 *
 * Источник эскейпится → XSS-safe.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMd(escaped: string): string {
  return escaped
    .replace(/`([^`]+)`/g, '<code class="bg-black/5 px-1 py-0.5 rounded text-[0.9em] font-mono">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
}

export function renderMarkdownToHtml(input: string): string {
  if (!input) return '';
  const lines = input.split(/\r?\n/);
  const html: string[] = [];

  let listType: 'ul' | 'ol' | null = null;
  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${paragraph.join('<br/>')}</p>`);
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line === '') {
      flushParagraph();
      closeList();
      continue;
    }

    const h3 = line.match(/^### (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    if (h2 || h3) {
      flushParagraph();
      closeList();
      const tag = h2 ? 'h3' : 'h4';
      const txt = (h2?.[1] || h3?.[1]) ?? '';
      html.push(`<${tag} class="font-semibold mt-2 mb-1">${inlineMd(escapeHtml(txt))}</${tag}>`);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      flushParagraph();
      closeList();
      html.push('<hr class="my-2 border-current opacity-20" />');
      continue;
    }

    const ulMatch = line.match(/^\s*[*\-]\s+(.+)$/);
    const olMatch = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ulMatch || olMatch) {
      flushParagraph();
      const wantType: 'ul' | 'ol' = ulMatch ? 'ul' : 'ol';
      if (listType !== wantType) {
        closeList();
        const cls = wantType === 'ul' ? 'list-disc' : 'list-decimal';
        html.push(`<${wantType} class="${cls} pl-5 my-1 space-y-0.5">`);
        listType = wantType;
      }
      const item = (ulMatch?.[1] || olMatch?.[1]) ?? '';
      html.push(`<li>${inlineMd(escapeHtml(item))}</li>`);
      continue;
    }

    closeList();
    paragraph.push(inlineMd(escapeHtml(line)));
  }
  flushParagraph();
  closeList();

  return html.join('');
}

export default function MarkdownMini({ children, className }: { children: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(children) }} />;
}
