import { render, screen } from "@testing-library/react";
import App from "./App.js";

test("renders welcome text", () => {
  render(<App />);
  const welcomeText = screen.getByText(
    /Welcome to the Kitman Frontend Code Challenge/i
  );
  expect(welcomeText).toBeInTheDocument();
});

test("renders kitman logo", () => {
  render(<App />);
  const kitmanLogoImg = screen.getByTestId("kitman-logo");
  expect(kitmanLogoImg).toBeInTheDocument();
});
