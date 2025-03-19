import { NextRequest, NextResponse } from 'next/server';

// In a real app, you'd fetch this from a database
const mockQuizzes = [
  {
    id: 'quiz_1',
    materialId: 'file_1',
    title: 'Introduction to Psychology - Standard Quiz',
    description: 'This standard quiz covers the basic concepts of psychology.',
    type: 'standard',
    created: '2023-05-15T10:30:00Z',
    questionCount: {
      easy: 5,
      medium: 5,
      hard: 5
    },
    lastAttempt: '2023-05-16T14:20:00Z',
    performance: {
      score: 85,
      completed: true,
      timeSpent: 1200 // seconds
    }
  },
  {
    id: 'quiz_2',
    materialId: 'file_2',
    title: 'Organic Chemistry - Adaptive Quiz',
    description: 'This adaptive quiz adjusts to your knowledge level of organic chemistry concepts.',
    type: 'adaptive',
    created: '2023-05-14T09:15:00Z',
    questionCount: {
      easy: 10,
      medium: 10,
      hard: 10
    },
    lastAttempt: null,
    performance: null
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');
    const quizId = searchParams.get('quizId');
    
    // Return a specific quiz if quizId is provided
    if (quizId) {
      const quiz = mockQuizzes.find(quiz => quiz.id === quizId);
      
      if (!quiz) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        message: 'Quiz fetched successfully',
        quiz
      });
    }
    
    // Filter by materialId if provided
    if (materialId) {
      const filteredQuizzes = mockQuizzes.filter(quiz => quiz.materialId === materialId);
      
      return NextResponse.json({
        message: 'Quizzes fetched successfully',
        quizzes: filteredQuizzes
      });
    }
    
    // Return all quizzes if no filters are applied
    return NextResponse.json({
      message: 'Quizzes fetched successfully',
      quizzes: mockQuizzes
    });
    
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Error fetching quizzes' },
      { status: 500 }
    );
  }
} 