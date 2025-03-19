'use client';

import { useState, useCallback } from 'react';
import UploadForm from '@/components/upload/UploadForm';
import MaterialsList from '@/components/upload/MaterialsList';

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadSuccess = useCallback(() => {
    // Increment the key to force a refresh of the MaterialsList component
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Study Dashboard</h1>
        
        <div className="mb-10">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Materials</h2>
          
          {/* Using key to force refresh of the component when uploads happen */}
          <MaterialsList key={refreshKey} />
        </div>
      </div>
    </main>
  );
} 