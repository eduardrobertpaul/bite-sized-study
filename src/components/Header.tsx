import Link from "next/link";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              BiteStudy
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              aria-label="Dashboard"
              tabIndex={0}
            >
              Dashboard
            </Link>
            <Link 
              href="/features" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              aria-label="Features"
              tabIndex={0}
            >
              Features
            </Link>
            <Link 
              href="/how-it-works" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              aria-label="How It Works"
              tabIndex={0}
            >
              How It Works
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              aria-label="Pricing"
              tabIndex={0}
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Log in
            </Button>
            <Button size="sm">
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 