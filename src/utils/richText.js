const ALLOWED_TAGS = new Set(['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE']);
const ALLOWED_ALIGNMENTS = new Set(['left', 'center', 'right', 'justify']);

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const isHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));

export const richTextToPlainText = (value = '') => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const sanitizeRichText = (value = '') => {
  if (!value) return '';
  if (typeof window === 'undefined' || !window.DOMParser) {
    return isHtml(value) ? '' : escapeHtml(value);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${value}</div>`, 'text/html');

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return doc.createTextNode(node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tag = node.tagName.toUpperCase();
    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = doc.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) fragment.appendChild(cleaned);
      });
      return fragment;
    }

    const el = doc.createElement(tag.toLowerCase());
    const textAlign = node.style?.textAlign || node.getAttribute?.('align');
    if (ALLOWED_ALIGNMENTS.has(textAlign)) {
      el.style.textAlign = textAlign;
    }
    Array.from(node.childNodes).forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) el.appendChild(cleaned);
    });
    return el;
  };

  const container = doc.createElement('div');
  Array.from(doc.body.firstChild.childNodes).forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) container.appendChild(cleaned);
  });

  return container.innerHTML
    .replace(/<p>(\s|&nbsp;|<br>)*<\/p>/gi, '')
    .trim();
};

export const normalizeRichText = (value = '') => {
  const source = String(value || '').trim();
  if (!source) return '';
  if (isHtml(source)) return sanitizeRichText(source);

  return sanitizeRichText(
    source
      .split(/\n{2,}/)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
      .join('')
  );
};

export const hasRichTextContent = (value = '') => richTextToPlainText(normalizeRichText(value)).length > 0;
