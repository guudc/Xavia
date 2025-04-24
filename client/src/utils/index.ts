function stripHTML(html?: string): string | undefined {  
  return html
    ? html
        .replace('```html\n', "") // Remove <html> and any of its attributes
        .replace('```', "")
        .trim()                       // Trim any extra spaces at the start/end
    : html;
}

export { stripHTML };
