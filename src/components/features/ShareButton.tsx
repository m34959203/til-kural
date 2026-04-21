'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;          // absolute URL of the page being shared
  title: string;        // short title for share dialogs
  text?: string;        // longer description
  image?: string;       // absolute OG image URL (hint for fallback channels)
  locale?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

/**
 * Universal share button (ТЗ 3.2.4.5).
 * - Native Web Share API when available (navigator.share).
 * - Fallback menu: Telegram / WhatsApp / Twitter / Copy link.
 * - Closes on outside click and Escape.
 */
export default function ShareButton({
  url,
  title,
  text,
  image,
  locale = 'ru',
  className,
  size = 'md',
  variant = 'outline',
}: ShareButtonProps) {
  const isKk = locale === 'kk';
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const doNativeOrMenu = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ url, title, text: text || title });
        return;
      } catch (err) {
        // User cancelled or share blocked — fall through to custom menu
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }
    setOpen((o) => !o);
  };

  const encoded = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    text: encodeURIComponent(text || title),
    combo: encodeURIComponent(`${title} — ${url}`),
  };

  const links = [
    {
      key: 'telegram',
      label: 'Telegram',
      icon: '✈️',
      href: `https://t.me/share/url?url=${encoded.url}&text=${encoded.text}`,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: '💬',
      href: `https://wa.me/?text=${encoded.combo}`,
    },
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: '𝕏',
      href: `https://twitter.com/intent/tweet?url=${encoded.url}&text=${encoded.text}`,
    },
  ];

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Legacy fallback
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // swallow
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };
  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800',
    outline: 'border-2 border-teal-700 text-teal-700 hover:bg-teal-50',
    ghost: 'text-teal-700 hover:bg-teal-50',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={doNativeOrMenu}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
          variants[variant],
          sizes[size],
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden>🔗</span>
        <span>{isKk ? 'Бөлісу' : 'Поделиться'}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
            {isKk ? 'Бөлісу' : 'Поделиться'}
          </div>
          <div className="py-1">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                <span aria-hidden className="w-5 text-center">{l.icon}</span>
                <span>{l.label}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800"
              role="menuitem"
            >
              <span aria-hidden className="w-5 text-center">📋</span>
              <span>
                {copied
                  ? isKk ? 'Көшірілді!' : 'Скопировано!'
                  : isKk ? 'Сілтемені көшіру' : 'Скопировать ссылку'}
              </span>
            </button>
          </div>
          {image && (
            <div className="px-4 py-2 border-t border-gray-100 text-[11px] text-gray-400">
              {isKk ? 'Превью OG сурет' : 'Превью OG изображения'}
              {' '}→{' '}
              <a href={image} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                {isKk ? 'қарау' : 'открыть'}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
