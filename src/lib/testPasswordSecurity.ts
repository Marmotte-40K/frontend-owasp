import { hashPassword, validatePasswordStrength } from '@/lib/passwordSecurity';

// Test semplice dell'hashing
export const testPasswordSecurity = async () => {
  console.log('🧪 Testing password security...');
  
  const testPassword = 'MySecureP@ssw0rd123';
  
  try {
    // Test validazione
    const validation = validatePasswordStrength(testPassword);
    console.log('📋 Password validation:', validation);
    
    // Test hashing
    const hashed = await hashPassword(testPassword);
    console.log('🔐 Hashed password:', hashed);
    console.log('✅ Password security test completed');
    
    return { success: true, validation, hashed };
  } catch (error) {
    console.error('❌ Password security test failed:', error);
    return { success: false, error };
  }
};

// Test dalla console del browser
if (typeof window !== 'undefined') {
  (window as any).testPasswordSecurity = testPasswordSecurity;
}
