import {
  APIEndpoint,
  APICall,
  APIError,
  SecurityAlert,
  APIMetrics,
  RateLimitStatus } from
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
    lastCalled: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    totalCalls: 15420,
    successRate: 98.5,
    avgResponseTime: 145,
    rateLimit: { perMinute: 100, perDay: 10000 },
    currentUsage: { perMinute: 45, perDay: 5420 }
  },
  {
    id: 'api-2',
    name: 'Get User Profile',
    endpoint: '/api/profiles/:userId',
    method: 'GET',
    status: 'active',
    category: 'User Management',
    lastCalled: new Date(Date.now() - 30 * 1000).toISOString(),
    totalCalls: 28950,
    successRate: 99.2,
    avgResponseTime: 85,
    rateLimit: { perMinute: 200, perDay: 50000 },
    currentUsage: { perMinute: 120, perDay: 18950 }
  },
  {
    id: 'api-3',
    name: 'Create Expense',
    endpoint: '/api/expenses',
    method: 'POST',
    status: 'active',
    category: 'Expenses',
    lastCalled: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    totalCalls: 42300,
    successRate: 97.8,
    avgResponseTime: 210,
    rateLimit: { perMinute: 150, perDay: 20000 },
    currentUsage: { perMinute: 85, perDay: 12300 }
  },
  {
    id: 'api-4',
    name: 'Get Expenses',
    endpoint: '/api/expenses',
    method: 'GET',
    status: 'active',
    category: 'Expenses',
    lastCalled: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    totalCalls: 65200,
    successRate: 99.5,
    avgResponseTime: 120,
    rateLimit: { perMinute: 300, perDay: 100000 },
    currentUsage: { perMinute: 180, perDay: 45200 }
  },
  {
    id: 'api-5',
    name: 'Create Goal',
    endpoint: '/api/goals',
    method: 'POST',
    status: 'active',
    category: 'Goals',
    lastCalled: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    totalCalls: 8450,
    successRate: 96.5,
    avgResponseTime: 180,
    rateLimit: { perMinute: 50, perDay: 5000 },
    currentUsage: { perMinute: 15, perDay: 2450 }
  },
  {
    id: 'api-6',
    name: 'Get Investment Data',
    endpoint: '/api/investments/funds',
    method: 'GET',
    status: 'active',
    category: 'Investments',
    lastCalled: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    totalCalls: 18750,
    successRate: 94.2,
    avgResponseTime: 450,
    rateLimit: { perMinute: 100, perDay: 10000 },
    currentUsage: { perMinute: 65, perDay: 8750 }
  },
  {
    id: 'api-7',
    name: 'External Market API',
    endpoint: '/api/external/market-data',
    method: 'GET',
    status: 'maintenance',
    category: 'External',
    lastCalled: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    totalCalls: 5200,
    successRate: 88.5,
    avgResponseTime: 850,
    rateLimit: { perMinute: 30, perDay: 1000 },
    currentUsage: { perMinute: 0, perDay: 200 }
  },
  {
    id: 'api-8',
    name: 'Admin Dashboard',
    endpoint: '/api/admin/dashboard',
    method: 'GET',
    status: 'active',
    category: 'Admin',
    lastCalled: new Date(Date.now() - 15 * 1000).toISOString(),
    totalCalls: 3250,
    successRate: 99.8,
    avgResponseTime: 95,
    rateLimit: { perMinute: 50, perDay: 5000 },
    currentUsage: { perMinute: 8, perDay: 1250 }
  }];


  private mockErrors: APIError[] = [
  {
    id: 'err-1',
    apiId: 'api-3',
    apiName: 'Create Expense',
    endpoint: '/api/expenses',
    statusCode: 400,
    errorType: '4xx',
    errorMessage: 'Invalid expense amount: must be greater than 0',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    userId: 'user-123',
    userEmail: 'john@example.com',
    ipAddress: '192.168.1.105',
    module: 'Expense Tracker',
    resolved: false
  },
  {
    id: 'err-2',
    apiId: 'api-6',
    apiName: 'Get Investment Data',
    endpoint: '/api/investments/funds',
    statusCode: 503,
    errorType: '5xx',
    errorMessage:
    'External service unavailable: Market data provider timeout',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.110',
    module: 'Investment Module',
    resolved: false
  },
  {
    id: 'err-3',
    apiId: 'api-1',
    apiName: 'User Authentication',
    endpoint: '/api/auth/login',
    statusCode: 401,
    errorType: '4xx',
    errorMessage: 'Invalid credentials',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    userId: 'user-456',
    userEmail: 'sarah@example.com',
    ipAddress: '192.168.1.120',
    module: 'Authentication',
    resolved: true
  },
  {
    id: 'err-4',
    apiId: 'api-2',
    apiName: 'Get User Profile',
    endpoint: '/api/profiles/:userId',
    statusCode: 404,
    errorType: '4xx',
    errorMessage: 'User profile not found',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    userId: 'user-789',
    userEmail: 'mike@example.com',
    ipAddress: '192.168.1.130',
    module: 'User Management',
    resolved: false
  },
  {
    id: 'err-5',
    apiId: 'api-5',
    apiName: 'Create Goal',
    endpoint: '/api/goals',
    statusCode: 500,
    errorType: '5xx',
    errorMessage: 'Database connection timeout',
    stackTrace: 'Error: Connection timeout\n  at Database.connect...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: 'user-321',
    userEmail: 'emma@example.com',
    ipAddress: '192.168.1.140',
    module: 'Goals Module',
    resolved: true
  }];


  private mockSecurityAlerts: SecurityAlert[] = [
  {
    id: 'sec-1',
    type: 'rate_limit_exceeded',
    severity: 'high',
    apiId: 'api-6',
    apiName: 'Get Investment Data',
    ipAddress: '192.168.1.150',
    userId: 'user-555',
    description:
    'User exceeded rate limit: 150 requests in 1 minute (limit: 100)',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    resolved: false
  },
  {
    id: 'sec-2',
    type: 'suspicious_activity',
    severity: 'critical',
    apiId: 'api-1',
    apiName: 'User Authentication',
    ipAddress: '203.45.67.89',
    description:
    'Multiple failed login attempts from same IP: 25 attempts in 5 minutes',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    resolved: false,
    actionTaken: 'IP temporarily blocked'
  },
  {
    id: 'sec-3',
    type: 'unauthorized_access',
    severity: 'medium',
    apiId: 'api-8',
    apiName: 'Admin Dashboard',
    ipAddress: '192.168.1.160',
    userId: 'user-666',
    description: 'Non-admin user attempted to access admin endpoint',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    resolved: true
  }];


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
  generateReport(type: 'weekly' | 'monthly'): string {
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