import { BaseService } from '../base/base';

interface FeedbackData {
  content: string;
  type: 'bug' | 'feature' | 'general';
  contactInfo?: string;
}

export class SystemService extends BaseService {
  async getConfig(): Promise<any> {
    return this.callFunction('system', {
      action: 'config'
    });
  }

  async getNotices(): Promise<any> {
    return this.callFunction('system', {
      action: 'notice'
    });
  }

  async submitFeedback(feedback: FeedbackData): Promise<any> {
    return this.callFunction('system', {
      action: 'feedback',
      feedback
    });
  }
}

export const systemService = new SystemService();