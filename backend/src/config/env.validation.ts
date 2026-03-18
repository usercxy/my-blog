import * as Joi from 'joi';

interface EnvVars {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  APP_NAME: string;
  DATABASE_URL: string;
  CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
}

const envSchema = Joi.object<EnvVars>({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(8000),
  APP_NAME: Joi.string().trim().default('personal-blog-api'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  CORS_ORIGIN: Joi.string().allow('').default('http://localhost:3000,http://localhost:5173'),
  JWT_ACCESS_SECRET: Joi.string().trim().min(8).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().trim().default('2h'),
  JWT_REFRESH_SECRET: Joi.string().trim().min(8).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().trim().default('7d'),
});

export function validateEnv(config: Record<string, unknown>) {
  const { error, value } = envSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }

  return value;
}
