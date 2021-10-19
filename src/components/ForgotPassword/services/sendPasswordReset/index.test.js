import resetUserPassword from "./index";
import { CustomException } from "utils/Error";

describe("Testing the send password reset service", () => {
  beforeEach(() => {
    global.firebase = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.firebase;
  });

  describe("Successful scenario", () => {
    test("Should successfully send a password reset", async () => {
      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(),
      };
      const email = "test@email.com";

      return expect(await resetUserPassword(email)).toBeTruthy();
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

    test("Invalid email address used", async () => {
      const email = "test@@@email.com";

      const invalidEmailError = new MockError("auth/invalid-email");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(() => {
          throw invalidEmailError;
        }),
      };

      await expect(resetUserPassword(email)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "The email address provided is invalid."
        )
      );
    });

    test("Missing continue URL for password reset", async () => {
      const email = "test@email.com";

      const missingUrlError = new MockError("auth/missing-continue-uri");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(() => {
          throw missingUrlError;
        }),
      };

      await expect(resetUserPassword(email)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "No URL was provided in the password reset request."
        )
      );
    });

    test("Invalid continue URL for password reset", async () => {
      const email = "test@email.com";

      const invalidUrlError = new MockError("auth/invalid-continue-uri");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(() => {
          throw invalidUrlError;
        }),
      };

      await expect(resetUserPassword(email)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "The URL provided in the password reset request is invalid."
        )
      );
    });

    test("Unauthorized continue URL for password reset", async () => {
      const email = "test@email.com";

      const unAuthUrlError = new MockError("auth/unauthorized-continue-uri");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(() => {
          throw unAuthUrlError;
        }),
      };

      await expect(resetUserPassword(email)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "The domain of the password reset request URL is not authorized."
        )
      );
    });

    test("User not found for password reset", async () => {
      const email = "test@email.com";

      const userNotFoundError = new MockError("auth/user-not-found");

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(() => {
          throw userNotFoundError;
        }),
      };

      await expect(resetUserPassword(email)).rejects.toThrowError(
        new CustomException(
          "Forgot Password Error",
          "There is no user associated with this email address. Unable to reset password."
        )
      );
    });

    test("General undefined error", async () => {
      const email = "test@email.com";

      const genError = new MockError(
        "auth/some-new-error",
        "A general error has occurred while trying to reset the user's password."
      );

      global.firebase = {
        auth: jest.fn().mockReturnThis(),
        useDeviceLanguage: jest.fn().mockReturnThis(),
        sendPasswordResetEmail: jest.fn(() => {
          throw genError;
        }),
      };

      await expect(resetUserPassword(email)).rejects.toThrowError(
        CustomException
      );
    });
  });
});
