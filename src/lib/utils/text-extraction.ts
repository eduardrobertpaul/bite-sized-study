import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error}`);
    throw new Error(`Failed to extract text from PDF: ${error}`);
  }
}

/**
 * Extract text from a DOCX file
 * @param filePath Path to the DOCX file
 * @returns Extracted text content
 */
export async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    // For now, we're just returning a placeholder
    // The full implementation would use a proper DOCX parsing library
    return `Content extracted from DOCX: ${path.basename(filePath)}`;
    
    // TODO: Implement proper DOCX parsing when needed using a compatible library
  } catch (error) {
    console.error(`Error extracting text from DOCX: ${error}`);
    throw new Error(`Failed to extract text from DOCX: ${error}`);
  }
}

/**
 * Extract text from a plain text file
 * @param filePath Path to the text file
 * @returns Extracted text content
 */
export async function extractTextFromTXT(filePath: string): Promise<string> {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error extracting text from TXT: ${error}`);
    throw new Error(`Failed to extract text from TXT: ${error}`);
  }
}

/**
 * Extract text from a file based on its extension
 * @param filePath Path to the file
 * @returns Extracted text content
 */
export async function extractTextFromFile(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return extractTextFromPDF(filePath);
    case '.docx':
      return extractTextFromDOCX(filePath);
    case '.txt':
      return extractTextFromTXT(filePath);
    case '.doc':
      throw new Error('DOC format is not supported directly. Please convert to DOCX or PDF.');
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

/**
 * Clean and preprocess the extracted text
 * @param text Raw extracted text
 * @returns Cleaned and processed text
 */
export function preprocessText(text: string): string {
  if (!text) return '';
  
  // Remove extra whitespace
  let cleanedText = text.replace(/\s+/g, ' ').trim();
  
  // Remove common headers/footers (this would need to be customized for specific documents)
  // This is a simplified example that would remove page numbers
  cleanedText = cleanedText.replace(/\bPage \d+\b/gi, '');
  
  return cleanedText;
}

/**
 * Split the text into chunks of a specified size
 * @param text The text to split
 * @param chunkSize Maximum size of each chunk (in characters)
 * @returns Array of text chunks
 */
export function splitTextIntoChunks(text: string, chunkSize: number = 4000): string[] {
  if (!text) return [];
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by paragraphs to preserve context
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, save current chunk and start a new one
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    currentChunk += paragraph + '\n\n';
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
} 