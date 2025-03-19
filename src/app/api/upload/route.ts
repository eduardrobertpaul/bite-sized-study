import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { extractTextFromFile } from '@/lib/utils/text-extraction';
import { cleanText, splitIntoChunks, detectSections, extractKeyTerms } from '@/lib/utils/text-processor';

type FileInfo = {
  id: string;
  originalName: string;
  savedAs: string;
  type: string;
  size: number;
  path: string;
  uploadDate: string;
  processingError?: boolean;
};

type ProcessedDocument = FileInfo & {
  title: string | null;
  sections: { heading: string; content: string }[];
  keyTerms: { term: string; definition: string }[];
  chunks: string[];
};

export async function POST(request: NextRequest) {
  try {
    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files were uploaded' },
        { status: 400 }
      );
    }

    const savedFiles: FileInfo[] = [];
    const processedDocuments: ProcessedDocument[] = [];

    for (const file of files) {
      try {
        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create a unique filename to avoid collisions
        const timestamp = new Date().getTime();
        const fileId = `${timestamp}`;
        const filename = `${fileId}-${file.name}`;
        const filepath = join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        
        const fileInfo: FileInfo = {
          id: fileId,
          originalName: file.name,
          savedAs: filename,
          type: file.type,
          size: file.size,
          path: filepath,
          uploadDate: new Date().toISOString()
        };
        
        savedFiles.push(fileInfo);
        
        // Process the text (if we're not in production, we'll do a simplified version)
        // In production, this would be done by a background job or serverless function
        try {
          // Step 1: Extract text from the file
          const extractedText = await extractTextFromFile(filepath);
          
          // Step 2: Clean and preprocess the text
          const cleanedText = cleanText(extractedText);
          
          // Step 3: Split the text into chunks
          const chunks = splitIntoChunks(cleanedText);
          
          // Step 4: Detect document sections
          const { title, sections } = detectSections(cleanedText);
          
          // Step 5: Extract key terms and definitions
          const keyTerms = extractKeyTerms(cleanedText);
          
          // Step 6: Save all processed data
          const processedDocument: ProcessedDocument = {
            ...fileInfo,
            title,
            sections,
            keyTerms,
            chunks
          };
          
          processedDocuments.push(processedDocument);
          
          // TODO: In a production environment, this would be stored in a database
          
        } catch (processingError) {
          console.error(`Error processing file ${file.name}:`, processingError);
          // We'll still include the file in savedFiles, but mark it as having processing issues
          savedFiles[savedFiles.length - 1].processingError = true;
        }
      } catch (fileError) {
        console.error(`Error handling file ${file.name}:`, fileError);
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${files.length} files`,
      files: savedFiles,
      processed: processedDocuments.length > 0,
      documentCount: processedDocuments.length,
      // For testing purposes, return document info (in production we'd just return IDs)
      // Only return the first 3 sections for preview
      documentPreview: processedDocuments.map(doc => ({
        id: doc.id,
        originalName: doc.originalName,
        title: doc.title,
        sectionCount: doc.sections.length,
        keyTermCount: doc.keyTerms.length,
        chunkCount: doc.chunks.length,
        sections: doc.sections.slice(0, 3),
        keyTerms: doc.keyTerms.slice(0, 5)
      })),
      note: "In the next phase, the preprocessed text will be sent to the LLM API for generating study materials. You will need to provide an LLM API key for that phase."
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading files' },
      { status: 500 }
    );
  }
} 