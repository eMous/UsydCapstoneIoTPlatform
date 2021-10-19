import React from "react";
import renderer from "react-test-renderer";
import { fireEvent, screen, render, waitFor } from "@testing-library/react";
import ForgotPassword from "./index";

jest.mock("./services/sendPasswordReset");
import resetUserPassword from "./services/sendPasswordReset";

describe("ForgotPassword component", () => {
  test("Snapshot of component is rendered", () => {
    const component = renderer.create(<ForgotPassword />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe("Reset password fails", () => {
    afterAll(() => {
      jest.clearAllMocks();
    });

    test("Error helper text is displayed when password reset has an error", async () => {
      resetUserPassword.mockImplementation(() => {
        throw new Error(
          "Forgot Password Error: The email address provided is invalid."
        );
      });

      render(<ForgotPassword />);

      // Click on the Reset Password button
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Reset my password/i));
      });

      // We expect an error text to appear
      expect(await screen.getByText(/forgot password error/i)).toBeTruthy();
    });
  });

  describe("Reset password succeeds", () => {
    afterAll(() => {
      jest.clearAllMocks();
    });

    test("Successful Snackbar appears after email is successfully sent out", async () => {
      resetUserPassword.mockImplementation(() => jest.fn());
      render(<ForgotPassword />);

      const resetPwdBtn = screen.getByText(/Reset my password/i);

      // Click the reset password button
      fireEvent.click(resetPwdBtn);

      // Wait for the Snackbar to appear
      await waitFor(() => {
        expect(screen.getByText(/Your password reset link/i)).toBeTruthy();
      });
    });

    test("Reset password button is disabled after successfully completing operation", async () => {
      resetUserPassword.mockImplementation(() => jest.fn());
      render(<ForgotPassword />);

      const resetPwdBtn = screen.getByText(/Reset my password/i);

      // Click the reset password button
      fireEvent.click(resetPwdBtn);

      // Wait for the button to be disabled
      await waitFor(() => {
        expect(
          screen.getByText(/Reset my password/i).closest("button")
        ).toBeDisabled();
      });
    });

    test("Reset password button is re-enabled after being disabled for some time", async () => {
      resetUserPassword.mockImplementation(() => jest.fn());
      render(<ForgotPassword />);

      const resetPwdBtn = screen.getByText(/Reset my password/i);

      // Click the reset password button
      fireEvent.click(resetPwdBtn);

      // Wait for the button to be re-enabled
      await waitFor(() => {
        expect(
          screen.getByText(/Reset my password/i).closest("button")
        ).not.toBeDisabled();
      });
    });

    test("Successful Snackbar disappears after some time", async () => {
      resetUserPassword.mockImplementation(() => jest.fn());

      render(<ForgotPassword />);

      const resetPwdBtn = screen.getByText(/Reset my password/i);

      // Click the reset password button
      fireEvent.click(resetPwdBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Your password reset link/i)).toBeNull;
      });
    });
  });
});
