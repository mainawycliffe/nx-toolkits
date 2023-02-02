import { AppComponent } from './app.component';
import { render, screen } from '@testing-library/angular';

it('should render component correctly', async () => {
  await render(AppComponent, {});

  expect(
    screen.queryByRole('heading', {
      level: 1,
    })
  ).toBeInTheDocument();

  expect(
    screen.queryByRole('heading', {
      level: 1,
    })
  ).toHaveTextContent('Hello World');

  expect(
    screen.queryByRole('heading', {
      level: 2,
    })
  ).toBeInTheDocument();

  expect(
    screen.queryByRole('heading', {
      level: 2,
    })
  ).toHaveTextContent('Hello World 2');

  expect(screen.getByRole('img')).toBeInTheDocument();
});
