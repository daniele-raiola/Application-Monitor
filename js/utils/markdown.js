/**
 * markdown.js
 * Markdown rendering utility using marked.js
 * IMPORTANT: Always sanitize HTML before rendering
 */

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12/lib/marked.esm.js';

export function renderMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    const html = marked.parse(text, {
      breaks: true,
      gfm: true
    });

    return html;
  } catch (e) {
    console.error('Markdown parse error:', e);
    return text;
  }
}

export function simpleRender(text) {
  if (!text) return '';
  
  let html = text;
  
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  html = html.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  html = html.replace(/\n/g, '<br>');
  
  return html;
}