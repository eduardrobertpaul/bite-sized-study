import { BookOpen, Brain, FileQuestion, Zap } from "lucide-react";

const features = [
  {
    name: "AI-Generated Quizzes",
    description:
      "Upload your course materials and our AI will automatically generate quizzes with varying difficulty levels to test your knowledge.",
    icon: FileQuestion,
  },
  {
    name: "Smart Flashcards",
    description:
      "Create comprehensive flashcard decks instantly from your uploaded content, perfect for quick reviews and memorization.",
    icon: Zap,
  },
  {
    name: "Study Summaries",
    description:
      "Get concise summaries of complex topics, making it easier to understand and review key concepts quickly.",
    icon: BookOpen,
  },
  {
    name: "Personalized Learning",
    description:
      "Our system adapts to your learning style and knowledge gaps, providing customized study materials that focus on what you need most.",
    icon: Brain,
  },
];

const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Study Smarter, Not Harder
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Transform your study materials into interactive learning tools with our AI-powered platform.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features; 