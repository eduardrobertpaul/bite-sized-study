'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import QuizList from '@/components/quiz/QuizList';

type MaterialPageProps = {
  params: {
    id: string;
  };
};

type MaterialDetail = {
  id: string;
  originalName: string;
  savedAs: string;
  type: string;
  size: number;
  path: string;
  uploadDate: string;
  title: string;
  sectionCount: number;
  keyTermCount: number;
  chunkCount: number;
  sections: { heading: string; content: string }[];
  keyTerms: { term: string; definition: string }[];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MaterialPage({ params }: MaterialPageProps) {
  const { id } = params;
  const router = useRouter();
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  useEffect(() => {
    const fetchMaterial = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/materials');
        if (!response.ok) {
          throw new Error(`Error fetching material: ${response.status}`);
        }
        const data = await response.json();
        const materialData = data.files.find((file: any) => file.id === id);
        
        if (!materialData) {
          throw new Error('Material not found');
        }
        
        setMaterial(materialData);
      } catch (err) {
        console.error('Failed to fetch material:', err);
        setError('Failed to load material. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaterial();
  }, [id]);
  
  const handleGoBack = () => {
    router.push('/dashboard');
  };
  
  const handleQuizGenerated = (quizId: string) => {
    // Switch to the quizzes tab after generation
    setActiveTabIndex(1);
  };
  
  if (isLoading) {
    return (
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </main>
    );
  }
  
  if (error || !material) {
    return (
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={handleGoBack}
            className="inline-flex items-center mb-6 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          
          <div className="p-6 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error || 'Material not found'}
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center mb-6 text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-10 w-10 text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{material.title}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(material.uploadDate).toLocaleDateString()} • {(material.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {material.sectionCount} sections
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {material.keyTermCount} key terms
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {material.chunkCount} learning chunks
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tab.Group selectedIndex={activeTabIndex} onChange={setActiveTabIndex}>
          <Tab.List className="flex space-x-1 rounded-xl bg-indigo-100 p-1 mb-8">
            <Tab
              className={({ selected }: { selected: boolean }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Material Overview
            </Tab>
            <Tab
              className={({ selected }: { selected: boolean }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Quizzes
            </Tab>
            <Tab
              className={({ selected }: { selected: boolean }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Flashcards
            </Tab>
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel className="focus:outline-none">
              <div className="space-y-8">
                {/* Material sections */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Content Sections</h2>
                  <div className="space-y-4">
                    {material.sections.map((section, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-gray-900 mb-2">{section.heading}</h3>
                        <p className="text-gray-600 text-sm">{section.content.substring(0, 200)}...</p>
                      </div>
                    ))}
                    
                    {material.sections.length === 0 && (
                      <p className="text-gray-500">No sections available</p>
                    )}
                  </div>
                </div>
                
                {/* Key terms */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Key Terms</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {material.keyTerms.map((term, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <h3 className="font-medium text-gray-900 mb-2">{term.term}</h3>
                        <p className="text-gray-600 text-sm">{term.definition}</p>
                      </div>
                    ))}
                    
                    {material.keyTerms.length === 0 && (
                      <p className="text-gray-500">No key terms available</p>
                    )}
                  </div>
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel className="focus:outline-none">
              <div className="space-y-6">
                <QuizGenerator 
                  materialId={id} 
                  materialTitle={material.title}
                  onQuizGenerated={handleQuizGenerated}
                />
                
                <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Your Quizzes</h2>
                <QuizList materialId={id} />
              </div>
            </Tab.Panel>
            
            <Tab.Panel className="focus:outline-none">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Flashcards</h2>
                <p className="text-gray-500">Flashcard functionality coming soon!</p>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </main>
  );
} 