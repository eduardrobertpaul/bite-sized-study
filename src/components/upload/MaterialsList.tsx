'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type UploadedFile = {
  id: string;
  originalName: string;
  savedAs: string;
  type: string;
  size: number;
  path: string;
  uploadDate: string;
  title?: string;
  sectionCount?: number;
  keyTermCount?: number;
  chunkCount?: number;
};

const MaterialsList = () => {
  const [materials, setMaterials] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) {
        throw new Error(`Error fetching materials: ${response.status}`);
      }
      const data = await response.json();
      setMaterials(data.files || []);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setError('Failed to load your materials. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

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

  const handleViewMaterial = (materialId: string) => {
    router.push(`/material/${materialId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">
          You haven't uploaded any materials yet. Upload your first document above to get started!
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-gray-200">
        {materials.map((file, index) => (
          <li key={index} className="py-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {getFileTypeLabel(file.type)} • {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.uploadDate).toLocaleString()}
                </p>
                {file.sectionCount && (
                  <div className="flex mt-2 space-x-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                      {file.sectionCount} sections
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                      {file.keyTermCount} key terms
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <button 
                  onClick={() => handleViewMaterial(file.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  tabIndex={0}
                  aria-label="View material details and study aids"
                  onKeyDown={(e) => e.key === 'Enter' && handleViewMaterial(file.id)}
                >
                  View Material
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialsList; 