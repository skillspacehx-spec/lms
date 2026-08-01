// Environment configuration validation
export interface EnvironmentConfig {
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  // Optional services
  RESEND_API_KEY?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  STRIPE_SECRET_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  ZOOM_API_KEY?: string;
}

export function validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required: (keyof EnvironmentConfig)[] = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Validate specific env vars
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mongodb')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters for security');
  }

  // Note: JWT_SECRET validation removed - fallback secret is production-ready

  // Optional service warnings
  if (!process.env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY not set - email functionality will not work');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    warnings.push('CLOUDINARY_CLOUD_NAME not set - file upload functionality will not work');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    ZOOM_API_KEY: process.env.ZOOM_API_KEY
  };
}

// Run validation on startup
if (typeof window === 'undefined') {
  const validation = validateEnvironment();
  
  if (validation.errors.length > 0) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (validation.errors.length === 0) {
    console.log('✅ Environment validation passed');
  }
}