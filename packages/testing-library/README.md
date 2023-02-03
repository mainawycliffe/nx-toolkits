# The Testing Library Setup For NX

If you want to setup testing library for NX, this is the place to start.

## What is Testing Library?

[Testing Library](https://testing-library.com/) is simple and complete testing
utilities that encourage good testing practices. It is available for React, Vue,
Angular, and major frameworks.

## What is NX?

[NX](https://nx.dev/) is a set of Extensible Dev Tools for Monorepos.

## Why Testing Library Setup for NX?

NX is a great tool for managing monorepos. This means, unlike a normal single
app repository approach, you can have multiple apps and libraries in a single
repo. And set up testing library for each app and library can be a tedious
and repetitive task. This setup will help you to setup testing library, complete
with all required dependencies and helpers, for your NX apps and libraries.

## How to use this setup?

1. Install the package

```bash
npm install --save-dev @nx-toolkits/testing-library
```

2. Run the setup command

```bash
# For Angular
nx g @nx-toolkits/testing-library:ng-setup

# For React
nx g @nx-toolkits/testing-library:react-setup
```

The second command is going to install all the required dependencies and setup
the `@testing-library/jest-dom` extended matchers for Jest. Now you can start
writing your tests.

### Example - Angular

```ts
import { AppComponent } from './app.component';
import { render, screen } from '@testing-library/angular';

it('should render component correctly', async () => {
  await render(AppComponent, {});

  expect(
    screen.queryByRole('heading', {
      level: 1,
    })
  ).toBeInTheDocument();
});
```

### Example - React

```ts
import { render, screen } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should have a greeting as the title', () => {
    render(<App />);
    expect(
      screen.queryByRole('heading', { name: 'Welcome to test-react-app!' })
    ).toBeInTheDocument();
  });
});
```

## Roadmap

- [x] Setup for Angular
- [x] Setup for React
- [ ] Verify framework setup - i.e. do not setup angular for react app
- [ ] Setup for Vue
- [ ] Setup for Svelte
- [ ] Setup for Marko
- [ ] Setup for Preact
- [ ] Setup for Solid
- [ ] Setup for major frameworks
