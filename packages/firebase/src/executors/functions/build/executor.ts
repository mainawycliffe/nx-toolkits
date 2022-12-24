import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Executor ran for Build', options);

  // run firebase build command
  

  return {
    success: true,
    
  };
}
