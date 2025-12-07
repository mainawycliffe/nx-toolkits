import { Tree } from '@nx/devkit';
import { NormalizedSchema } from '../schema';

export default function updateFirebaseJSON(
  tree: Tree,
  options: NormalizedSchema
) {
  const firebaseJsonPath = 'firebase.json';

  // Read existing firebase.json or create new one
  const firebaseJson = tree.exists(firebaseJsonPath)
    ? JSON.parse(tree.read(firebaseJsonPath, 'utf-8'))
    : {};

  // Initialize hosting array if it doesn't exist
  if (!firebaseJson.hosting) {
    firebaseJson.hosting = [];
  }

  // Convert to array if it's an object
  if (!Array.isArray(firebaseJson.hosting)) {
    firebaseJson.hosting = [firebaseJson.hosting];
  }

  // Check if hosting config for this site already exists
  const existingConfigIndex = firebaseJson.hosting.findIndex(
    (config) =>
      config.site === options.siteName || config.target === options.siteName
  );

  const hostingConfig: any = {
    target: options.siteName,
    public: options.outputPath,
    ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
  };

  // Add SSR rewrites if enabled (takes precedence over SPA rewrites)
  if (options.ssr && options.ssrFunction) {
    hostingConfig.rewrites = [
      {
        source: '**',
        function: {
          functionId: options.ssrFunction,
          region: options.region || 'us-central1',
        },
      },
    ];
  }
  // Add SPA rewrites if requested and SSR is not enabled
  else if (options.rewrites !== false) {
    hostingConfig.rewrites = [
      {
        source: '**',
        destination: '/index.html',
      },
    ];
  }

  // Add security headers if requested
  if (options.headers !== false) {
    hostingConfig.headers = [
      {
        source: '**/*.@(jpg|jpeg|gif|png|svg|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      {
        source: '**/*.@(css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      {
        source: '**',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  }

  // Update or add the hosting configuration
  if (existingConfigIndex >= 0) {
    firebaseJson.hosting[existingConfigIndex] = hostingConfig;
  } else {
    firebaseJson.hosting.push(hostingConfig);
  }

  // Write updated firebase.json
  tree.write(firebaseJsonPath, JSON.stringify(firebaseJson, null, 2));
}
