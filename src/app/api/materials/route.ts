import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const uploadDir = join(process.cwd(), 'uploads');
    
    // Check if upload directory exists
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        files: []
      });
    }
    
    // Read all files in the uploads directory
    const fileNames = await readdir(uploadDir);
    
    // Get file details
    const filePromises = fileNames.map(async (fileName) => {
      const filePath = join(uploadDir, fileName);
      const fileStats = await stat(filePath);
      
      // Extract original filename from the timestamp-prefixed name
      // Format is: timestamp-originalname
      const timestampEndIndex = fileName.indexOf('-');
      
      if (timestampEndIndex <= 0) {
        // Invalid format, skip this file
        return null;
      }
      
      const fileId = fileName.substring(0, timestampEndIndex);
      const originalName = fileName.substring(timestampEndIndex + 1);
      
      // Determine file type based on extension
      const extension = originalName.split('.').pop()?.toLowerCase();
      let mimeType = 'application/octet-stream'; // Default
      
      if (extension === 'pdf') mimeType = 'application/pdf';
      else if (extension === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (extension === 'doc') mimeType = 'application/msword';
      else if (extension === 'txt') mimeType = 'text/plain';
      
      // Basic file info
      const fileInfo = {
        id: fileId,
        originalName,
        savedAs: fileName,
        type: mimeType,
        size: fileStats.size,
        path: filePath,
        uploadDate: fileStats.mtime.toISOString()
      };
      
      // Try to load processed data from metadata file if it exists
      // In a real app, this would come from a database or dedicated metadata store
      try {
        // For now, we'll just check if the file was successfully processed in the upload step
        // In a real implementation with a database, we'd fetch metadata about the processing
        
        // For demo purposes, we'll use our knowledge of the response format from the upload API
        // We'll add some basic section and key term info
        
        return {
          ...fileInfo,
          title: originalName.replace(/\.\w+$/, ''),
          sectionCount: Math.floor(Math.random() * 10) + 5, // Mock data
          keyTermCount: Math.floor(Math.random() * 15) + 10, // Mock data
          chunkCount: Math.floor(Math.random() * 20) + 5, // Mock data
          sections: [
            { heading: 'Introduction', content: 'Introduction content...' },
            { heading: 'Chapter 1', content: 'Chapter 1 content...' },
            { heading: 'Chapter 2', content: 'Chapter 2 content...' },
          ],
          keyTerms: [
            { term: 'Term 1', definition: 'Definition for term 1...' },
            { term: 'Term 2', definition: 'Definition for term 2...' },
            { term: 'Term 3', definition: 'Definition for term 3...' },
            { term: 'Term 4', definition: 'Definition for term 4...' },
            { term: 'Term 5', definition: 'Definition for term 5...' },
          ]
        };
      } catch (metadataError) {
        console.error(`Error loading metadata for ${fileName}:`, metadataError);
        return fileInfo;
      }
    });
    
    const allFiles = await Promise.all(filePromises);
    const files = allFiles.filter(file => file !== null); // Remove nulls from invalid files
    
    // Sort files by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    
    return NextResponse.json({
      files
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
} 