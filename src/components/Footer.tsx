import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/features" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Features"
                  tabIndex={0}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/how-it-works" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="How It Works"
                  tabIndex={0}
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Pricing"
                  tabIndex={0}
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Help Center"
                  tabIndex={0}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Contact Us"
                  tabIndex={0}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="FAQ"
                  tabIndex={0}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="About Us"
                  tabIndex={0}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Blog"
                  tabIndex={0}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Careers"
                  tabIndex={0}
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Privacy Policy"
                  tabIndex={0}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-500 hover:text-indigo-600"
                  aria-label="Terms of Service"
                  tabIndex={0}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {/* Social links could go here */}
          </div>
          <p className="mt-8 text-base text-gray-500 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} BiteStudy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 