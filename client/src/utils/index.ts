function stripHTML(html?: string): string | undefined {
  return html
    ? html
        .replace(/<html[^>]*>/gi, "") // Remove <html> and any of its attributes
        .replace(/<\/html>/gi, "")    // Remove closing </html> tag
        .replace(/<[^>]*>/g, "")      // Remove any other HTML tags
        .trim()                       // Trim any extra spaces at the start/end
    : html;
}

export { stripHTML };
