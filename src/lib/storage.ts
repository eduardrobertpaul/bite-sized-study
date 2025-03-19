import fs from 'fs';
import path from 'path';
import { LLMResponse } from './llm';

const DATA_DIR = path.join(process.cwd(), 'data');
const LLM_RESPONSES_DIR = path.join(DATA_DIR, 'llm-responses');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(LLM_RESPONSES_DIR)) {
  fs.mkdirSync(LLM_RESPONSES_DIR, { recursive: true });
}

/**
 * Stores an LLM response to the filesystem
 */
export const storeLLMResponse = async (
  materialId: string,
  response: LLMResponse
): Promise<void> => {
  const materialDir = path.join(LLM_RESPONSES_DIR, materialId);
  
  if (!fs.existsSync(materialDir)) {
    fs.mkdirSync(materialDir, { recursive: true });
  }
  
  const filePath = path.join(materialDir, `${response.chunkId}.json`);
  
  await fs.promises.writeFile(
    filePath,
    JSON.stringify(response, null, 2),
    'utf-8'
  );
};

/**
 * Retrieves all LLM responses for a specific material
 */
export const getLLMResponsesForMaterial = async (
  materialId: string
): Promise<LLMResponse[]> => {
  const materialDir = path.join(LLM_RESPONSES_DIR, materialId);
  
  if (!fs.existsSync(materialDir)) {
    return [];
  }
  
  const files = await fs.promises.readdir(materialDir);
  const responses: LLMResponse[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(materialDir, file);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      responses.push(JSON.parse(data) as LLMResponse);
    }
  }
  
  return responses;
};

/**
 * Retrieves a specific LLM response by materialId and chunkId
 */
export const getLLMResponse = async (
  materialId: string,
  chunkId: string
): Promise<LLMResponse | null> => {
  const filePath = path.join(LLM_RESPONSES_DIR, materialId, `${chunkId}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const data = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(data) as LLMResponse;
}; 