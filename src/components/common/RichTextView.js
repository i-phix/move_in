import React from 'react';
import { normalizeRichText } from '../../utils/richText';

function RichTextView({ value, className = '' }) {
  const html = normalizeRichText(value);
  if (!html) return null;

  return (
    <div
      className={`mi-rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default RichTextView;
