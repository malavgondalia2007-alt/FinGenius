import {
  APIEndpoint,
  APICall,
  APIError,
  SecurityAlert,
  APIMetrics,
  RateLimitStatus
} from
  '../types';

// Mock API Monitoring Service
class APIMonitoringService {
  private mockAPIs: APIEndpoint[] = [
    {
      id: 'api-1',
      name: 'User Authentication',
      endpoint: '/api/auth/login',
      method: 'POST',
      status: 'active',
      category: 'Authentication',
      lastCalled: new Date().toISOString(),
      totalCalls: 15420,
      successRate: 100,
      avgResponseTime: 120,
      rateLimit: { perMinute: 100, perDay: 10000 },
      currentUsage: { perMinute: 5, perDay: 120 }
    },
    {
      id: 'api-2',
      name: 'Get User Profile',
      endpoint: '/api/profiles/me',
      method: 'GET',
      status: 'active',
      category: 'User Management',
      lastCalled: new Date().toISOString(),
      totalCalls: 28950,
      successRate: 100,
      avgResponseTime: 85,
      rateLimit: { perMinute: 200, perDay: 50000 },
      currentUsage: { perMinute: 12, perDay: 850 }
    },
    {
      id: 'api-3',
      name: 'Create Expense',
      endpoint: '/api/expenses',
      method: 'POST',
      status: 'active',
      category: 'Expenses',
      lastCalled: new Date().toISOString(),
      totalCalls: 42300,
      successRate: 100,
      avgResponseTime: 150,
      rateLimit: { perMinute: 150, perDay: 20000 },
      currentUsage: { perMinute: 8, perDay: 2300 }
    },
    {
      id: 'api-4',
      name: 'Get Expenses',
      endpoint: '/api/expenses',
      method: 'GET',
      status: 'active',
      category: 'Expenses',
      lastCalled: new Date().toISOString(),
      totalCalls: 65200,
      successRate: 100,
      avgResponseTime: 110,
      rateLimit: { perMinute: 300, perDay: 100000 },
      currentUsage: { perMinute: 25, perDay: 5200 }
    },
    {
      id: 'api-5',
      name: 'Get Goals',
      endpoint: '/api/goals',
      method: 'GET',
      status: 'active',
      category: 'Goals',
      lastCalled: new Date().toISOString(),
      totalCalls: 8450,
      successRate: 100,
      avgResponseTime: 95,
      rateLimit: { perMinute: 50, perDay: 5000 },
      currentUsage: { perMinute: 3, perDay: 450 }
    },
    {
      id: 'api-6',
      name: 'Stock Quotes API',
      endpoint: '/api/stocks/quotes',
      method: 'GET',
      status: 'active',
      category: 'Market Data',
      lastCalled: new Date().toISOString(),
      totalCalls: 125400,
      successRate: 100,
      avgResponseTime: 210,
      rateLimit: { perMinute: 60, perDay: 5000 },
      currentUsage: { perMinute: 30, perDay: 1500 }
    }
  ];

  private mockErrors: APIError[] = [];
  private mockSecurityAlerts: SecurityAlert[] = [];
  private mockCalls: APICall[] = [];

  constructor() {
    // Generate some mock API calls
    this.generateMockCalls();
  }

  private generateMockCalls() {
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      const api =
        this.mockAPIs[Math.floor(Math.random() * this.mockAPIs.length)];
      const isSuccess = Math.random() > 0.05;
      this.mockCalls.push({
        id: `call-${i}`,
        apiId: api.id,
        apiName: api.name,
        endpoint: api.endpoint,
        method: api.method,
        statusCode: isSuccess ? 200 : Math.random() > 0.5 ? 400 : 500,
        responseTime: Math.floor(Math.random() * 500) + 50,
        timestamp: new Date(now - Math.random() * 3600000).toISOString(),
        userId:
          Math.random() > 0.3 ?
            `user-${Math.floor(Math.random() * 1000)}` :
            undefined,
        userEmail:
          Math.random() > 0.3 ?
            `user${Math.floor(Math.random() * 1000)}@example.com` :
            undefined,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
    }
  }

  // Get all API endpoints
  getAPIs(): APIEndpoint[] {
    return this.mockAPIs;
  }

  // Get API by ID
  getAPIById(id: string): APIEndpoint | undefined {
    return this.mockAPIs.find((api) => api.id === id);
  }

  // Update API status
  updateAPIStatus(
    id: string,
    status: 'active' | 'inactive' | 'maintenance')
    : boolean {
    const api = this.mockAPIs.find((api) => api.id === id);
    if (api) {
      api.status = status;
      return true;
    }
    return false;
  }

  // Get overall API metrics
  getMetrics(): APIMetrics {
    const totalCalls = this.mockAPIs.reduce(
      (sum, api) => sum + api.totalCalls,
      0
    );
    const successfulCalls = Math.floor(totalCalls * 0.975);
    const failedCalls = totalCalls - successfulCalls;

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      avgResponseTime: 185,
      callsPerMinute: 450,
      callsPerHour: 27000,
      callsPerDay: 648000,
      errorRate: 2.5,
      uptime: 99.8
    };
  }

  // Get recent API calls
  getRecentCalls(limit: number = 20): APICall[] {
    return this.mockCalls.
      sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).
      slice(0, limit);
  }

  // Get API errors
  getErrors(resolved?: boolean): APIError[] {
    if (resolved === undefined) {
      return this.mockErrors;
    }
    return this.mockErrors.filter((err) => err.resolved === resolved);
  }

  // Resolve error
  resolveError(id: string): boolean {
    const error = this.mockErrors.find((err) => err.id === id);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  // Get security alerts
  getSecurityAlerts(resolved?: boolean): SecurityAlert[] {
    if (resolved === undefined) {
      return this.mockSecurityAlerts;
    }
    return this.mockSecurityAlerts.filter(
      (alert) => alert.resolved === resolved
    );
  }

  // Resolve security alert
  resolveSecurityAlert(id: string, actionTaken: string): boolean {
    const alert = this.mockSecurityAlerts.find((a) => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.actionTaken = actionTaken;
      return true;
    }
    return false;
  }

  // Get rate limit status
  getRateLimitStatus(): RateLimitStatus[] {
    return this.mockAPIs.map((api) => ({
      apiId: api.id,
      apiName: api.name,
      limit: api.rateLimit.perMinute,
      current: api.currentUsage.perMinute,
      percentage: api.currentUsage.perMinute / api.rateLimit.perMinute * 100,
      resetTime: new Date(Date.now() + 60000).toISOString(),
      exceeded: api.currentUsage.perMinute > api.rateLimit.perMinute
    }));
  }

  // Generate CSV report
  generateReport(_type: 'weekly' | 'monthly'): string {
    const headers = [
      'API Name',
      'Endpoint',
      'Method',
      'Total Calls',
      'Success Rate',
      'Avg Response Time',
      'Status'];


    const rows = this.mockAPIs.map((api) => [
      api.name,
      api.endpoint,
      api.method,
      api.totalCalls.toString(),
      `${api.successRate}%`,
      `${api.avgResponseTime}ms`,
      api.status]
    );

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }

  // Generate error report
  generateErrorReport(): string {
    const headers = [
      'Timestamp',
      'API Name',
      'Endpoint',
      'Status Code',
      'Error Type',
      'Error Message',
      'User Email',
      'IP Address',
      'Resolved'];


    const rows = this.mockErrors.map((err) => [
      err.timestamp,
      err.apiName,
      err.endpoint,
      err.statusCode.toString(),
      err.errorType,
      `"${err.errorMessage}"`,
      err.userEmail || 'N/A',
      err.ipAddress,
      err.resolved ? 'Yes' : 'No']
    );

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }
}

export const apiMonitoringService = new APIMonitoringService();