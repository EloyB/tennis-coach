const ENV = process.env.NEXT_PUBLIC_ENV || 'development';

export const FeatureFlags = {
  TRAINING_SESSION_MANAGEMENT: 'feature.trainingSessionManagement',
} as const;

export function isFeatureEnabled(flagName: string): boolean {
  // Check for explicit override in environment
  const envKey = `NEXT_PUBLIC_FF_${flagName.replace(/\./g, '_').toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    return envValue === 'true';
  }

  // Default behavior based on environment
  // development and staging: new features ON by default
  // production: new features OFF by default
  return ENV === 'development' || ENV === 'staging';
}
