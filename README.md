# Bite-Sized Study

An innovative study aid application that helps university students learn more effectively through AI-powered quiz generation and adaptive learning.

## Features

- **Smart Material Processing**: Upload and process study materials (PDFs, DOCs, TXT)
- **AI-Powered Quiz Generation**: Generate various types of quizzes:
  - Standard multi-level quizzes
  - Adaptive learning quizzes
  - Interleaved practice quizzes
  - Case study quizzes
  - Concept mapping exercises
- **Interactive Learning**: Engage with content through:
  - Dynamic question difficulty adjustment
  - Detailed explanations and feedback
  - Progress tracking
  - Performance analytics
- **Modern UI**: Beautiful and responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **AI Integration**: LLM API for content processing and quiz generation
- **Icons**: Heroicons
- **UI Components**: Headless UI

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bite-sized-study
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and helpers
- `/public` - Static assets
- `/uploads` - Temporary storage for uploaded files (gitignored)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
