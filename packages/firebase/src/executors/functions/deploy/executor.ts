import { execSync } from 'child_process';
import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Deploying Firebase Functions...');
  // run firebase deploy command sync or async
  const res = execSync('firebase deploy --only functions');
  console.log(res.toString());
  return {
    success: true,
  };
}
