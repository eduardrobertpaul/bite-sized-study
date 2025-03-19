'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

type FileWithPreview = {
  file: File;
  preview: string | null;
};

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

const UploadForm = ({ onUploadSuccess }: UploadFormProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const allowedFileTypes = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain',
    'application/msword'
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles: FileWithPreview[] = [];
    
    Array.from(e.target.files).forEach(file => {
      if (!allowedFileTypes.includes(file.type)) {
        setError(`File type ${file.type} is not supported. Please upload PDF, DOCX, or TXT files.`);
        return;
      }
      
      // For PDFs and DOCXs we don't show previews currently
      const preview = file.type.startsWith('text/') 
        ? URL.createObjectURL(file) 
        : null;
      
      newFiles.push({ file, preview });
    });
    
    setFiles([...files, ...newFiles]);
    e.target.value = ''; // Reset the input
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    
    // Revoke the object URL to avoid memory leaks
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const formData = new FormData();
      files.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      // Handle successful response
      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Clear the files after successful upload
      setFiles([]);
      setSuccessMessage(`Successfully uploaded ${files.length} file(s)!`);
      
      // Call the onUploadSuccess callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    if (fileType === 'application/msword') return 'DOC';
    if (fileType === 'text/plain') return 'TXT';
    return fileType.split('/')[1]?.toUpperCase() || 'Unknown';
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Course Materials</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 mb-2">Drag and drop your files here, or click to browse</p>
          <p className="text-sm text-gray-500">Supports PDF, DOCX, and TXT files</p>
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.doc"
            className="hidden"
          />
        </div>
        
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Selected Files ({files.length})</h3>
            <ul className="space-y-2">
              {files.map((fileObj, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between bg-gray-50 rounded-md p-3"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(fileObj.file.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-700">{fileObj.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {getFileTypeLabel(fileObj.file.type)} • {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Remove file"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading || files.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm; 