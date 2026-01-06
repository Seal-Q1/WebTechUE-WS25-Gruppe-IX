import type { Response } from 'express';

export const sendNotFound = (res: Response, message = "Resource not found :(") => {
  res.status(404).json({ error: message });
};

export const sendBadRequest = (res: Response, message = "Bad request :(") => {
  res.status(400).json({ error: message });
};

export const sendInternalError = (res: Response, error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  res.status(500).json({ error: "Internal server error :(" });
};
