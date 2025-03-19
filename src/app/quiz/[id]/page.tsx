'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ChevronRightIcon, ChevronLeftIcon, HomeIcon, ArrowPathIcon, LightBulbIcon } from '@heroicons/react/24/outline';

// Types for Quiz and Questions
type QuizQuestion = {
  id: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  relatedConcepts?: string[];
  metadata?: {
    bloomLevel?: string;
    estimatedTime?: number;
    tags?: string[];
    sourceSection?: string;
  };
  userAnswer?: string | string[] | null;
  isCorrect?: boolean;
};

type Quiz = {
  id: string;
  materialId: string;
  title: string;
  description: string;
  type: string;
  questionSets: {
    easy: QuizQuestion[];
    medium: QuizQuestion[];
    hard: QuizQuestion[];
  };
  adaptive: {
    initialSkillEstimate: number;
    difficultyMapping: Record<string, number>;
    learningObjectives: string[];
  };
  interleaving: {
    relatedTopics: string[];
    conceptConnections: Array<{ from: string; to: string; relationship: string }>;
  };
  created: string;
};

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStats, setQuizStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    totalTime: 0,
    startTime: Date.now(),
  });
  
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [skillEstimate, setSkillEstimate] = useState(0.5); // 0-1 range
  
  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quiz/fetch?quizId=${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.status}`);
        }
        
        const data = await response.json();
        setQuiz(data.quiz);
        
        // Initialize with easy questions first
        if (data.quiz.questionSets.easy.length > 0) {
          setActiveQuestions(data.quiz.questionSets.easy);
        }
        
        // Update difficulty based on quiz type
        if (data.quiz.type === 'adaptive') {
          const initialSkill = data.quiz.adaptive.initialSkillEstimate || 0.5;
          setSkillEstimate(initialSkill);
          determineQuestionDifficulty(initialSkill);
        }
        
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id]);
  
  // Determine which difficulty to use based on skill estimate
  const determineQuestionDifficulty = (skill: number) => {
    if (!quiz) return;
    
    let newDifficulty: 'easy' | 'medium' | 'hard';
    
    if (skill < 0.4) {
      newDifficulty = 'easy';
    } else if (skill < 0.7) {
      newDifficulty = 'medium';
    } else {
      newDifficulty = 'hard';
    }
    
    if (newDifficulty !== currentDifficulty) {
      setCurrentDifficulty(newDifficulty);
      
      // Switch question set based on difficulty
      if (quiz.questionSets[newDifficulty].length > 0) {
        setActiveQuestions(quiz.questionSets[newDifficulty]);
        setCurrentIndex(0); // Reset index when changing difficulty
      }
    }
  };
  
  // Update skill estimate based on answer correctness
  const updateSkillEstimate = (isCorrect: boolean) => {
    const difficultyValue = currentDifficulty === 'easy' ? 0.3 : 
                           currentDifficulty === 'medium' ? 0.6 : 0.9;
    
    // Simple Bayesian update (simplified for demo)
    const learningRate = 0.1;
    const update = isCorrect ? learningRate : -learningRate;
    const weightedUpdate = update * difficultyValue;
    
    const newSkill = Math.max(0, Math.min(1, skillEstimate + weightedUpdate));
    setSkillEstimate(newSkill);
    
    // Determine if we should change difficulty
    determineQuestionDifficulty(newSkill);
  };
  
  const handleSelectAnswer = (answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isSubmitted) return;
    
    const currentQuestion = activeQuestions[currentIndex];
    const isCorrect = Array.isArray(currentQuestion.answer) 
      ? currentQuestion.answer.includes(selectedAnswer as string)
      : currentQuestion.answer === selectedAnswer;
    
    // Update the question with user's answer
    const updatedQuestion = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect,
    };
    
    // Update questions array
    const updatedQuestions = [...activeQuestions];
    updatedQuestions[currentIndex] = updatedQuestion;
    setActiveQuestions(updatedQuestions);
    
    // Update stats
    setQuizStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
    
    // For adaptive quizzes, update skill estimate
    if (quiz?.type === 'adaptive') {
      updateSkillEstimate(isCorrect);
    }
    
    setIsSubmitted(true);
    setShowExplanation(true);
  };
  
  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setShowExplanation(false);
    } else {
      // End of quiz
      setQuizComplete(true);
      setQuizStats(prev => ({
        ...prev,
        totalTime: Math.floor((Date.now() - prev.startTime) / 1000)
      }));
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      
      // Restore previous answer if it exists
      const prevQuestion = activeQuestions[currentIndex - 1];
      setSelectedAnswer(prevQuestion.userAnswer || null);
      setIsSubmitted(prevQuestion.userAnswer !== undefined);
      setShowExplanation(prevQuestion.userAnswer !== undefined);
    }
  };
  
  const handleSkipQuestion = () => {
    // Mark as skipped
    const updatedQuestions = [...activeQuestions];
    updatedQuestions[currentIndex] = {
      ...updatedQuestions[currentIndex],
      userAnswer: null,
      isCorrect: false,
    };
    setActiveQuestions(updatedQuestions);
    
    // Update stats
    setQuizStats(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
    }));
    
    // Move to next question
    handleNextQuestion();
  };
  
  const handleRestartQuiz = () => {
    // Reset all quiz state
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowExplanation(false);
    setQuizComplete(false);
    setSkillEstimate(quiz?.adaptive.initialSkillEstimate || 0.5);
    setCurrentDifficulty('easy');
    
    // Reset questions (remove user answers)
    if (quiz) {
      setActiveQuestions(quiz.questionSets.easy.map(q => ({
        ...q,
        userAnswer: undefined,
        isCorrect: undefined,
      })));
    }
    
    // Reset stats
    setQuizStats({
      correct: 0,
      incorrect: 0,
      skipped: 0,
      totalTime: 0,
      startTime: Date.now(),
    });
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleGoToDashboard = () => {
    router.push('/dashboard');
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
  
  if (error || !quiz) {
    return (
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={handleGoBack}
            className="inline-flex items-center mb-6 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Go Back
          </button>
          
          <div className="p-6 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error || 'Quiz not found'}
          </div>
        </div>
      </main>
    );
  }
  
  if (quizComplete) {
    const totalQuestions = quizStats.correct + quizStats.incorrect + quizStats.skipped;
    const scorePercentage = totalQuestions > 0 ? Math.round((quizStats.correct / totalQuestions) * 100) : 0;
    
    return (
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-600">{scorePercentage}%</span>
                </div>
                {/* This would be a circular progress bar in a real implementation */}
                <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-8 border-indigo-600 rounded-full"
                  style={{ 
                    clipPath: `polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 50% 50%)`,
                    transform: `rotate(${scorePercentage * 3.6}deg)`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{quizStats.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{quizStats.incorrect}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{quizStats.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-8">
              <h2 className="font-medium text-indigo-800 mb-2">Learning Progress</h2>
              <p className="text-gray-700 mb-2">
                You've demonstrated knowledge in the following areas:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-2">
                {quiz.adaptive.learningObjectives.slice(0, 3).map((objective, i) => (
                  <li key={i}>{objective}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-700">
                {quiz.type === 'adaptive' ? 
                  `Your estimated skill level: ${Math.round(skillEstimate * 100)}%` : 
                  `Quiz difficulty: ${currentDifficulty}`
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Restart Quiz
              </button>
              <button
                onClick={handleGoToDashboard}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  const currentQuestion = activeQuestions[currentIndex];
  
  if (!currentQuestion) {
    return (
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
            No questions available for this quiz.
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleGoBack}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Exit Quiz
          </button>
          
          <div className="text-sm font-medium text-gray-500">
            Question {currentIndex + 1} of {activeQuestions.length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-indigo-50 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${currentDifficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                   currentDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                   'bg-red-100 text-red-800'}`}
                >
                  {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
                </span>
                
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {currentQuestion.type.replace('-', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>
              
              {currentQuestion.metadata?.bloomLevel && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Bloom: {currentQuestion.metadata.bloomLevel.charAt(0).toUpperCase() + currentQuestion.metadata.bloomLevel.slice(1)}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>
            
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors
                      ${selectedAnswer === option ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}
                      ${isSubmitted && option === currentQuestion.answer ? 'border-green-500 bg-green-50' : ''}
                      ${isSubmitted && selectedAnswer === option && option !== currentQuestion.answer ? 'border-red-500 bg-red-50' : ''}
                    `}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        {isSubmitted && option === currentQuestion.answer ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : isSubmitted && selectedAnswer === option && option !== currentQuestion.answer ? (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <div className={`h-5 w-5 rounded-full border ${selectedAnswer === option ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}></div>
                        )}
                      </div>
                      <div>{option}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'true-false' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleSelectAnswer('True')}
                  className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedAnswer === 'True' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}
                    ${isSubmitted && 'True' === currentQuestion.answer ? 'border-green-500 bg-green-50' : ''}
                    ${isSubmitted && selectedAnswer === 'True' && 'True' !== currentQuestion.answer ? 'border-red-500 bg-red-50' : ''}
                  `}
                >
                  True
                </button>
                <button
                  onClick={() => handleSelectAnswer('False')}
                  className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedAnswer === 'False' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}
                    ${isSubmitted && 'False' === currentQuestion.answer ? 'border-green-500 bg-green-50' : ''}
                    ${isSubmitted && selectedAnswer === 'False' && 'False' !== currentQuestion.answer ? 'border-red-500 bg-red-50' : ''}
                  `}
                >
                  False
                </button>
              </div>
            )}
            
            {/* For other question types, a custom UI would be implemented */}
            
            {showExplanation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <LightBulbIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Explanation</h3>
                    <p className="text-gray-700 text-sm">{currentQuestion.explanation}</p>
                    
                    {currentQuestion.relatedConcepts && currentQuestion.relatedConcepts.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-blue-800 mb-1">Related Concepts</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentQuestion.relatedConcepts.map((concept, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <div>
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium mr-2
                ${currentIndex === 0 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }
              `}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleSkipQuestion}
              disabled={isSubmitted}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium
                ${isSubmitted
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                }
              `}
            >
              Skip
            </button>
          </div>
          
          <div>
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${!selectedAnswer
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }
                `}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {currentIndex < activeQuestions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Finish Quiz'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 