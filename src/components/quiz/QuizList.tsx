'use client';

import { useState, useEffect } from 'react';
import { AcademicCapIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type QuizListProps = {
  materialId: string;
};

type Quiz = {
  id: string;
  materialId: string;
  title: string;
  description: string;
  type: string;
  created: string;
  questionCount: {
    easy: number;
    medium: number;
    hard: number;
  };
  lastAttempt: string | null;
  performance: {
    score: number;
    completed: boolean;
    timeSpent: number;
  } | null;
};

const QuizList = ({ materialId }: QuizListProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quiz/fetch?materialId=${materialId}`);
        if (!response.ok) {
          throw new Error(`Error fetching quizzes: ${response.status}`);
        }
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [materialId]);

  const getQuizTypeIcon = (quizType: string) => {
    switch (quizType) {
      case 'adaptive':
        return <AcademicCapIcon className="h-8 w-8 text-indigo-500" />;
      case 'interleaved':
        return <span className="text-2xl">🔄</span>;
      case 'case-study':
        return <span className="text-2xl">🔍</span>;
      case 'concept-map':
        return <span className="text-2xl">🗺️</span>;
      default:
        return <span className="text-2xl">📝</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
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

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md border border-gray-200 p-6">
        <p className="text-gray-500 mb-4">
          No quizzes generated yet. Create your first quiz to start studying!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {getQuizTypeIcon(quiz.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                <p className="text-gray-600 mt-1">{quiz.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-1">Created:</span> {formatDate(quiz.created)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-1">Questions:</span> 
                    {quiz.questionCount.easy + quiz.questionCount.medium + quiz.questionCount.hard}
                    <span className="text-xs ml-1">
                      ({quiz.questionCount.easy} easy, {quiz.questionCount.medium} medium, {quiz.questionCount.hard} hard)
                    </span>
                  </div>
                </div>
                
                {quiz.performance && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-md">
                    <h4 className="text-sm font-medium text-indigo-800 mb-2">Last Attempt</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 text-indigo-600 mr-1" />
                        <span className="text-sm text-gray-600">Score: <span className="font-medium">{quiz.performance.score}%</span></span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-indigo-600 mr-1" />
                        <span className="text-sm text-gray-600">Time: <span className="font-medium">{formatTime(quiz.performance.timeSpent)}</span></span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Status: 
                          <span className={`font-medium ml-1 ${quiz.performance.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {quiz.performance.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleStartQuiz(quiz.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {quiz.performance ? 'Continue Quiz' : 'Start Quiz'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizList; 