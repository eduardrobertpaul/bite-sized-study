/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    LLM_API_KEY: process.env.LLM_API_KEY,
    LLM_MODEL: process.env.LLM_MODEL,
    LLM_API_URL: process.env.LLM_API_URL,
    LLM_MAX_TOKENS: process.env.LLM_MAX_TOKENS,
    LLM_TEMPERATURE: process.env.LLM_TEMPERATURE,
  },
};

export default nextConfig;
