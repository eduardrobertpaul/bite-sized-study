/**
 * Advanced text processing utilities for course materials
 */

/**
 * Cleans the extracted text from common boilerplate and formatting issues
 * @param text Raw text from document extraction
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  if (!text) return '';
  
  let cleanedText = text;
  
  // Replace multiple whitespace characters with a single space
  cleanedText = cleanedText.replace(/\s+/g, ' ');
  
  // Remove common header/footer patterns
  cleanedText = removeHeaders(cleanedText);
  
  // Remove page numbers
  cleanedText = removePageNumbers(cleanedText);
  
  // Normalize line breaks
  cleanedText = normalizeLineBreaks(cleanedText);
  
  // Trim whitespace
  cleanedText = cleanedText.trim();
  
  return cleanedText;
}

/**
 * Removes common headers and footers from the text
 * @param text Text to process
 * @returns Text without headers/footers
 */
function removeHeaders(text: string): string {
  // Remove common header patterns
  // This is a simplified version - in a real implementation you might use more
  // sophisticated pattern matching based on document structure
  let processedText = text;
  
  // Common patterns in academic papers and course materials
  const headerPatterns = [
    /^.*confidential.*$/gim,
    /^.*all rights reserved.*$/gim,
    /^.*copyright.*$/gim,
    /^university of.*$/gim,
    /^department of.*$/gim,
    /^course:.*$/gim,
    /^instructor:.*$/gim,
  ];
  
  headerPatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, '');
  });
  
  return processedText;
}

/**
 * Removes page numbers from the text
 * @param text Text to process
 * @returns Text without page numbers
 */
function removePageNumbers(text: string): string {
  // Remove common page number formats
  let processedText = text;
  
  // Match standalone numbers that might be page numbers
  processedText = processedText.replace(/\b(Page|page)?\s*\d+\s*(of|\/)\s*\d+\b/g, '');
  processedText = processedText.replace(/\b(Page|page)?\s*\d+\b/g, '');
  
  return processedText;
}

/**
 * Normalizes line breaks for better paragraph detection
 * @param text Text to process
 * @returns Text with normalized line breaks
 */
function normalizeLineBreaks(text: string): string {
  // Convert all types of line breaks to standard format
  let processedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Normalize multiple line breaks to double line breaks for paragraph separation
  processedText = processedText.replace(/\n{3,}/g, '\n\n');
  
  return processedText;
}

/**
 * Splits the text into semantically meaningful chunks
 * @param text Cleaned text to split
 * @param maxChunkSize Maximum size of each chunk in characters
 * @returns Array of text chunks
 */
export function splitIntoChunks(text: string, maxChunkSize: number = 4000): string[] {
  if (!text) return [];
  
  // Split by paragraphs first to maintain context
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If this paragraph would exceed chunk size, complete the current chunk
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    // Handle paragraphs that are longer than max chunk size
    if (paragraph.length > maxChunkSize) {
      // If we have an existing chunk, finalize it first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split the long paragraph into sentences
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      let sentenceChunk = '';
      for (const sentence of sentences) {
        if (sentenceChunk.length + sentence.length > maxChunkSize) {
          if (sentenceChunk.length > 0) {
            chunks.push(sentenceChunk.trim());
            sentenceChunk = '';
          }
          
          // If a single sentence is too long, split it by word count
          if (sentence.length > maxChunkSize) {
            const words = sentence.split(/\s+/);
            let wordChunk = '';
            
            for (const word of words) {
              if (wordChunk.length + word.length + 1 > maxChunkSize) {
                chunks.push(wordChunk.trim());
                wordChunk = '';
              }
              wordChunk += (wordChunk ? ' ' : '') + word;
            }
            
            if (wordChunk.length > 0) {
              sentenceChunk = wordChunk;
            }
          } else {
            sentenceChunk = sentence;
          }
        } else {
          sentenceChunk += sentence;
        }
      }
      
      if (sentenceChunk.length > 0) {
        currentChunk = sentenceChunk;
      }
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Detects and tags sections in the document
 * @param text Text to process
 * @returns Text with section tags
 */
export function detectSections(text: string): { title: string | null, sections: { heading: string, content: string }[] } {
  if (!text) return { title: null, sections: [] };
  
  const lines = text.split('\n');
  const sections: { heading: string, content: string }[] = [];
  let currentSection: { heading: string, content: string } | null = null;
  let title: string | null = null;
  
  // Try to detect the document title from the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line && line.length < 100 && !line.endsWith('.')) {
      title = line;
      break;
    }
  }
  
  // Pattern for potential headings
  const headingPattern = /^(?:(?:\d+\.)+\s+|\b(?:chapter|section|part|module)\s+\d+:?\s+)?([A-Z][A-Za-z0-9\s:,\-_]+)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this might be a heading
    const headingMatch = line.match(headingPattern);
    const isHeading = headingMatch && 
                      line.length < 100 && 
                      line.split(' ').length < 10 &&
                      !line.endsWith('.') &&
                      (/[A-Z]/.test(line.charAt(0)));
    
    if (isHeading) {
      // If we already have a section, save it
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start a new section
      currentSection = {
        heading: line,
        content: ''
      };
    } else if (currentSection) {
      // Add to current section content
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    } else {
      // Create a default section if none exists yet
      currentSection = {
        heading: 'Introduction',
        content: line
      };
    }
  }
  
  // Add the last section if it exists
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return { title, sections };
}

/**
 * Identifies and extracts key terms and definitions from text
 * @param text The text to analyze
 * @returns Array of term-definition pairs
 */
export function extractKeyTerms(text: string): { term: string, definition: string }[] {
  if (!text) return [];
  
  const terms: { term: string, definition: string }[] = [];
  
  // Pattern for "Term: Definition" or "Term - Definition"
  const termDefinitionPatterns = [
    /\b([A-Z][a-zA-Z\s]{1,50}):\s+([^:]+?)(?=\n\n|\n[A-Z]|$)/g,
    /\b([A-Z][a-zA-Z\s]{1,50})\s+-\s+([^-]+?)(?=\n\n|\n[A-Z]|$)/g
  ];
  
  termDefinitionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1].trim();
      const definition = match[2].trim();
      
      // Only include if the term isn't too long and the definition has substance
      if (term.length < 50 && definition.length > 20 && definition.length < 500) {
        terms.push({ term, definition });
      }
    }
  });
  
  return terms;
} 