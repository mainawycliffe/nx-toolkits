import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Executor ran for deploy', options);
  return {
    success: true,
  };
}
