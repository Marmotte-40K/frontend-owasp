# 🛡️ Frontend OWASP Security Project

## 🎯 Overview
This React frontend application implements comprehensive security measures following OWASP Top 10 best practices. The application focuses on protecting against sensitive data exposure and implementing robust authentication mechanisms.

## 🔐 Security Features Implemented

### 1. **Secure Authentication System**
- **Cookie-based Token Storage**: Tokens are stored in secure HTTP-only cookies instead of localStorage
- **JWT Access/Refresh Token Pattern**: Short-lived access tokens (15 min) with long-lived refresh tokens (7 days)
- **Two-Factor Authentication (2FA)**: TOTP support using authenticator apps

**Why this matters:**
- Prevents XSS attacks from stealing tokens (localStorage is accessible via JavaScript)
- Reduces token exposure window with short-lived access tokens
- Provides additional security layer with 2FA even if passwords are compromised

### 2. **Axios Interceptors for Security**
- **Automatic Token Injection**: Access tokens automatically added to requests
- **Error Handling**: Centralized handling of 401/403 responses
- **Token Refresh**: Automatic refresh of expired tokens

**Why this matters:**
- Ensures consistent token handling across all API calls
- Prevents sensitive tokens from being logged or exposed in code
- Graceful handling of authentication failures

### 3. **Sensitive Data Protection**
- **Encrypted Storage**: Sensitive data (IBAN, Fiscal Code) encrypted at rest
- **Secure Transmission**: All sensitive data transmitted over HTTPS
- **Access Control**: User can only access their own sensitive data

**Why this matters:**
- Protects against data breaches (encrypted data is useless without keys)
- Prevents unauthorized access to personal financial information
- Complies with GDPR and PCI DSS requirements

### 4. **Account Security Features**
- **Account Lockout**: Protection against brute force attacks
- **Login Attempt Monitoring**: Failed login attempts are tracked
- **Device/Location Notifications**: Alerts for suspicious login activities

**Why this matters:**
- Prevents automated password attacks
- Provides early warning of account compromise
- Gives users visibility into account access

## 🏗️ Architecture & Security Patterns

### Authentication Flow
```
1. User Login → Server validates credentials
2. If 2FA enabled → Requires TOTP code
3. Server returns access/refresh tokens in secure cookies
4. Frontend stores tokens automatically via cookie headers
5. All subsequent requests include tokens via interceptors
6. Automatic refresh when access token expires
```

### Error Handling Strategy
- **Generic Error Messages**: Users see only generic error messages
- **Detailed Logging**: Full error details logged server-side for debugging
- **Security Event Logging**: All authentication events are logged
- **Data Masking**: Sensitive data masked in logs

### API Security Headers
```typescript
// Secure cookie attributes
{
  httpOnly: true,      // Prevents XSS access
  secure: true,        // HTTPS only
  sameSite: 'Strict',  // CSRF protection
  path: '/',           // Cookie scope
  maxAge: 900000       // 15 minutes for access token
}
```

## 📊 OWASP Top 10 Coverage

| OWASP Category | Status | Implementation |
|----------------|--------|----------------|
| **A01 - Broken Access Control** | 🟢 Covered | JWT-based authentication, role-based access |
| **A02 - Cryptographic Failures** | 🟢 Covered | Secure cookie storage, encrypted sensitive data |
| **A03 - Injection** | 🟡 Partial | API parameterization, input validation |
| **A04 - Insecure Design** | 🟢 Covered | Secure authentication flow, data protection |
| **A05 - Security Misconfiguration** | 🟢 Covered | Secure headers, proper error handling |
| **A06 - Vulnerable Components** | 🟡 Partial | Regular dependency updates needed |
| **A07 - Authentication Failures** | 🟢 Covered | 2FA, account lockout, secure sessions |
| **A08 - Data Integrity Failures** | 🟢 Covered | JWT signatures, token validation |
| **A09 - Logging Failures** | 🟢 Covered | Comprehensive logging with data masking |
| **A10 - Server-Side Request Forgery** | ⚪ N/A | Not applicable for frontend |

## 🔧 Implementation Details

### Token Management
```typescript
// Automatic token injection
api.interceptors.request.use((config) => {
  const token = getTokenFromCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeTokenFromCookie();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2FA Implementation
```typescript
// TOTP Setup
const qrCode = await authService.totp.getQRCode(userId);
// User scans QR with authenticator app

// TOTP Verification
const result = await authService.totp.verify(userId, totpCode);
```

### Sensitive Data Handling
```typescript
// Encrypted at rest, decrypted only when needed
const sensitiveData = await authService.getSensitiveData(userId);
// Data is automatically encrypted before transmission
await authService.saveSensitiveData(userId, {
  iban: "IT60 X054 2811 1010 0000 0123 456",
  fiscalCode: "RSSMRA80A01H501T"
});
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on localhost:8080

### Installation
```bash
npm install
npm run dev
```

### Environment Setup
Ensure your backend is configured with:
- HTTPS certificates
- Secure cookie settings
- CORS properly configured for your domain

## 🧪 Testing Security Features

### Authentication Testing
1. **Login Flow**: Test normal login and 2FA requirements
2. **Token Refresh**: Wait for access token expiry and verify automatic refresh
3. **Account Lockout**: Try multiple failed login attempts
4. **Logout**: Verify tokens are properly invalidated

### Sensitive Data Testing
1. **Access Control**: Verify users can only access their own data
2. **Encryption**: Check that sensitive data is encrypted in transit and at rest
3. **Error Handling**: Ensure no sensitive data leaks in error messages

### Security Headers Testing
Use browser dev tools to verify:
- Cookies have `HttpOnly`, `Secure`, `SameSite` attributes
- No tokens visible in localStorage or sessionStorage
- Proper CORS headers
- No sensitive data in console logs

## 🔒 Best Practices Implemented

1. **Defense in Depth**: Multiple layers of security
2. **Principle of Least Privilege**: Users only access their own data
3. **Secure by Default**: All features secure unless explicitly configured otherwise
4. **Privacy by Design**: Minimal data collection and secure storage
5. **Fail Securely**: System fails to secure state, not open state

## 📈 Monitoring & Logging

The application logs all security-relevant events:
- Authentication attempts (success/failure)
- Token refresh operations
- Access to sensitive data
- Account lockouts
- 2FA operations

All logs mask sensitive information while preserving debugging capability.

## 🛠️ Dependencies & Security

### Key Security Dependencies
- `axios`: HTTP client with interceptor support
- Cookie management through browser native APIs
- JWT handling for token validation

### Regular Security Maintenance
- Monthly dependency updates
- Security audit via `npm audit`
- Regular penetration testing
- Code review for security issues

## 📖 Additional Resources

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)

---

**⚠️ Security Notice**: This application implements multiple security measures, but security is an ongoing process. Regular security reviews, updates, and monitoring are essential for maintaining a secure application.
