import confirmPasswordReset from "./index";
import { CustomException } from "utils/Error";

describe("Testing the complete password reset service", () => {
  beforeEach(() => {
    global.firebase = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.firebase;
  });

  describe("Successful scenario", () => {
    test("Should successfully complete the password reset process", async () => {
      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(),
      };
      const authCode = "ABC47M";
      const newPwd = "#*)358vbIOSBC#@(bS97Z";

      return expect(await confirmPasswordReset(authCode, newPwd)).toBeTruthy();
    });
  });

  describe("Failure scenario", () => {
    class MockError extends Error {
      constructor(code, message = null) {
        super();
        this.code = code;
        this.message = message;
      }
    }

    test("The password reset authentication code has expired", async () => {
      const authCode = "ABC47M";
      const newPwd = "#*)358vbIOSBC#@(bS97Z";

      const expiredAuthCodeError = new MockError("auth/expired-action-code");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(() => {
          throw expiredAuthCodeError;
        }),
      };

      await expect(confirmPasswordReset(authCode, newPwd)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "The password reset code used has expired. Please request for a new code."
        )
      );
    });

    test("The password reset authentication code is invalid", async () => {
      const authCode = "ABC47M";
      const newPwd = "#*)358vbIOSBC#@(bS97Z";

      const invalidAuthCodeError = new MockError("auth/invalid-action-code");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(() => {
          throw invalidAuthCodeError;
        }),
      };

      await expect(confirmPasswordReset(authCode, newPwd)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "The password reset code used is invalid."
        )
      );
    });

    test("User account is disabled", async () => {
      const authCode = "ABC47M";
      const newPwd = "#*)358vbIOSBC#@(bS97Z";

      const userAccDisabledError = new MockError("auth/user-disabled");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(() => {
          throw userAccDisabledError;
        }),
      };

      await expect(confirmPasswordReset(authCode, newPwd)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "This user account has been disabled. Unable to reset this account's password."
        )
      );
    });

    test("User account does not exist", async () => {
      const authCode = "ABC47M";
      const newPwd = "#*)358vbIOSBC#@(bS97Z";

      const invalidAuthCodeError = new MockError("auth/user-not-found");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(() => {
          throw invalidAuthCodeError;
        }),
      };

      await expect(confirmPasswordReset(authCode, newPwd)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "This user account does not exist. Unable to reset this account's password."
        )
      );
    });

    test("New password for reset is too weak", async () => {
      const authCode = "ABC47M";
      const newPwd = "1111";

      const weakPwdError = new MockError("auth/weak-password");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(() => {
          throw weakPwdError;
        }),
      };

      await expect(confirmPasswordReset(authCode, newPwd)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "The new password used is too weak, please use a stronger password."
        )
      );
    });

    test("General undefined error", async () => {
      const authCode = "ABC47M";
      const newPwd = "#*)358vbIOSBC#@(bS97Z";

      const genError = new MockError(
        "auth/some-new-error",
        "A generic error has occurred while confirming the password reset."
      );

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        confirmPasswordReset: jest.fn(() => {
          throw genError;
        }),
      };

      await expect(confirmPasswordReset(authCode, newPwd)).rejects.toThrowError(
        CustomException
      );
    });
  });
});
