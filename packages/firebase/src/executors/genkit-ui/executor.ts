import { ExecutorContext } from '@nx/devkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GenkitUiExecutorSchema } from './schema';

const execAsync = promisify(exec);

export default async function runExecutor(
  options: GenkitUiExecutorSchema,
  context: ExecutorContext
) {
  const { port = 4000, host = 'localhost', open = true } = options;

  const projectName = context.projectName;
  if (!projectName) {
    throw new Error('Project name is required');
  }

  const project = context.projectsConfigurations?.projects[projectName];
  if (!project) {
    throw new Error(`Project ${projectName} not found`);
  }

  const projectRoot = project.root;

  console.log(`Starting Genkit Developer UI for ${projectName}...`);
  console.log(`Project root: ${projectRoot}`);
  console.log(`UI will be available at http://${host}:${port}`);

  try {
    // Build the genkit command to serve all functions in the directory
    const args = [
      'genkit',
      'start',
      '--',
      'npx',
      'tsx',
      '--watch',
      `${projectRoot}/src/index.ts`,
    ];

    const openFlag = open ? '' : '--no-open';
    const portFlag = `--port ${port}`;
    const hostFlag = `--host ${host}`;

    const genkitArgs = [openFlag, portFlag, hostFlag].filter(Boolean).join(' ');
    const command = `npx ${args.join(' ')} ${genkitArgs}`;

    console.log(`Running: ${command}`);

    // Execute the command
    const childProcess = exec(command, {
      cwd: context.root,
      env: {
        ...process.env,
        GENKIT_ENV: 'dev',
      },
    });

    // Stream output
    childProcess.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });

    childProcess.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });

    // Wait for process to complete or error
    await new Promise<void>((resolve, reject) => {
      childProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Genkit UI exited with code ${code}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(error);
      });

      // Handle process termination
      process.on('SIGTERM', () => {
        childProcess.kill('SIGTERM');
        resolve();
      });

      process.on('SIGINT', () => {
        childProcess.kill('SIGINT');
        resolve();
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting Genkit Developer UI:', error);
    return { success: false };
  }
}
