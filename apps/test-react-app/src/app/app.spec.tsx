import { render, screen } from '@testing-library/react';

import App from './app';
// import '@testing-library/jest-dom';

describe('App', () => {
  it('should have a greeting as the title', () => {
    render(<App />);
    expect(
      screen.queryByRole('heading', { name: 'Welcome to test-react-app!' })
    ).toBeInTheDocument();
  });
});
