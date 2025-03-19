'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type QuizGeneratorProps = {
  materialId: string;
  materialTitle: string;
  onQuizGenerated: (quizId: string) => void;
};

const quizTypes = [
  {
    id: 'standard',
    name: 'Standard Quiz',
    description: 'Traditional multi-level difficulty quiz with various question types',
    icon: '📝'
  },
  {
    id: 'adaptive',
    name: 'Adaptive Learning Quiz',
    description: 'Dynamically adjusts difficulty based on your performance',
    icon: '🧠'
  },
  {
    id: 'interleaved',
    name: 'Interleaved Practice',
    description: 'Mixes related concepts to enhance long-term retention',
    icon: '🔄'
  },
  {
    id: 'case-study',
    name: 'Case Study Quiz',
    description: 'Apply concepts to realistic scenarios and problems',
    icon: '🔍'
  },
  {
    id: 'concept-map',
    name: 'Concept Mapping',
    description: 'Build visual relationships between key concepts',
    icon: '🗺️'
  },
  {
    id: 'custom',
    name: 'Custom Quiz',
    description: 'Generate a quiz with your own custom instructions',
    icon: '✨'
  }
];

const QuizGenerator = ({ materialId, materialTitle, onQuizGenerated }: QuizGeneratorProps) => {
  const [selectedType, setSelectedType] = useState('standard');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId,
          quizType: selectedType,
          customPrompt: selectedType === 'custom' ? customPrompt : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.status}`);
      }
      
      const data = await response.json();
      onQuizGenerated(data.quiz.id);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate Quiz</h2>
      <p className="text-gray-600 mb-6">
        Create a personalized quiz for <span className="font-medium">{materialTitle}</span> by selecting a quiz type below.
      </p>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {quizTypes.map((type) => (
          <div
            key={type.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedType === type.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{type.icon}</div>
              <div>
                <h3 className="font-medium text-gray-900">{type.name}</h3>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedType === 'custom' && (
        <div className="mb-6">
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Instructions
          </label>
          <textarea
            id="customPrompt"
            rows={4}
            className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe the type of quiz you want to create..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating || (selectedType === 'custom' && !customPrompt.trim())}
          className={`
            inline-flex items-center px-4 py-2 rounded-md text-white font-medium
            ${isGenerating || (selectedType === 'custom' && !customPrompt.trim())
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }
          `}
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Generating Quiz...
            </>
          ) : (
            'Generate Quiz'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizGenerator; 