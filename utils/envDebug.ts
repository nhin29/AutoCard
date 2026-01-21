/**
 * Environment Variables Debug Utility
 * 
 * Use this to verify that environment variables are correctly embedded
 * in your built APK/IPA. These values are accessible at runtime via process.env.
 * 
 * SECURITY NOTE: EXPO_PUBLIC_* variables are embedded in the app bundle
 * and are visible to anyone who extracts the APK. Only use for public keys.
 */

export interface EnvStatus {
  name: string;
  isSet: boolean;
  value: string;
  maskedValue?: string; // First 8 chars + "..." for security
}

/**
 * Get status of all required environment variables
 * 
 * @param showValues - If true, includes actual values (use with caution in production)
 * @returns Array of environment variable statuses
 */
export function getEnvStatus(showValues: boolean = false): EnvStatus[] {
  const envVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_PLATE_RECOGNIZER_API_KEY',
  ];

  return envVars.map((name) => {
    const value = process.env[name] || '';
    const isSet = value.length > 0;
    
    // Mask sensitive values for security (show first 8 chars only)
    const maskedValue = isSet && value.length > 8 
      ? `${value.substring(0, 8)}...` 
      : isSet 
        ? '***' 
        : '';

    return {
      name,
      isSet,
      value: showValues ? value : '',
      maskedValue,
    };
  });
}

/**
 * Check if all required environment variables are set
 * 
 * @returns Object with overall status and missing variables list
 */
export function validateEnvVars(): {
  allSet: boolean;
  missing: string[];
  statuses: EnvStatus[];
} {
  const statuses = getEnvStatus(false);
  const missing = statuses.filter((s) => !s.isSet).map((s) => s.name);

  return {
    allSet: missing.length === 0,
    missing,
    statuses,
  };
}

/**
 * Log environment variable status to console
 * Useful for debugging in development or checking build configuration
 * 
 * @param showValues - If true, logs actual values (only use in development)
 */
export function logEnvStatus(showValues: boolean = false): void {
  const validation = validateEnvVars();
  
  console.log('=== Environment Variables Status ===');
  console.log(`All variables set: ${validation.allSet ? '✅' : '❌'}`);
  
  if (validation.missing.length > 0) {
    console.warn('Missing variables:', validation.missing.join(', '));
  }
  
  console.log('\nVariable details:');
  validation.statuses.forEach((status) => {
    const icon = status.isSet ? '✅' : '❌';
    const valueDisplay = showValues 
      ? ` = ${status.value}` 
      : status.maskedValue 
        ? ` = ${status.maskedValue}` 
        : ' (not set)';
    
    console.log(`${icon} ${status.name}${valueDisplay}`);
  });
  
  console.log('====================================');
}

/**
 * Get a specific environment variable value
 * 
 * @param name - Environment variable name (must start with EXPO_PUBLIC_)
 * @returns The value or empty string if not set
 */
export function getEnvVar(name: string): string {
  return process.env[name] || '';
}
