import { execSync } from 'child_process';
import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Deploying Firebase Functions...');
  // As firebase allows you to organize your projects in codebases, we need to
  // append the codebase to the command, so that we can deploy the correct
  // functions only.
  const { codebase } = options;
  const appendCodebase = codebase ? `:${codebase}` : '';
  // run firebase deploy command sync or async
  const res = execSync(`firebase deploy --only functions${appendCodebase}`);
  console.log(res.toString());
  return {
    success: true,
  };
}
