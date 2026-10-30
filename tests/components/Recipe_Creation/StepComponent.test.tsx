import StepComponent from "../../../src/components/Recipe_Creation/StepComponent";
import { render, screen } from '@testing-library/react';
import { stubRecipeBatch } from "../../stub";

describe('StepComponent', () => {
  test('renders the step component', () => {
    render(<StepComponent />);
    expect(screen.getByText('Step Component')).toBeInTheDocument();
  });
});