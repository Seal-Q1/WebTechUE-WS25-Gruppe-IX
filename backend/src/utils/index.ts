export { sendNotFound, sendBadRequest, sendInternalError } from './errors';

//TODO REMOVE ME AFTER TESTING
export function randomDelay(): Promise<void> {
  const delay = Math.random() * (3000 - 250) + 250;
  return new Promise(resolve => setTimeout(resolve, delay));
}
