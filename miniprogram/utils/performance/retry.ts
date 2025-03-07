interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  shouldRetry?: (error: any) => boolean;
}

export const retry = async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const { maxRetries = 3, delay = 1000, shouldRetry = () => true } = options;
  
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error) || retries >= maxRetries - 1) {
        throw error;
      }
      
      retries++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};