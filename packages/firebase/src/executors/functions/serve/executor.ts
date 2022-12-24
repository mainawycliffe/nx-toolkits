import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Executor ran for serve', options);
  return {
    success: true,
  };
}
