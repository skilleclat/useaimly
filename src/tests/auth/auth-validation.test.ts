import { describe, it, expect } from "vitest";
import {
  LoginSchema,
  SignupSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/lib/validation/auth.schema";

describe("Authentication Validation Schemas", () => {
  describe("LoginSchema", () => {
    it("accepts valid email and password", () => {
      const valid = {
        email: "user@Useaimly.finance",
        password: "securePassword123",
      };
      const result = LoginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const invalid = {
        email: "not-an-email",
        password: "securePassword123",
      };
      const result = LoginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("rejects passwords shorter than 6 characters", () => {
      const invalid = {
        email: "user@Useaimly.finance",
        password: "123",
      };
      const result = LoginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });
  });

  describe("SignupSchema", () => {
    it("accepts valid signup input", () => {
      const valid = {
        fullName: "Amina Mwangi",
        email: "amina@Useaimly.finance",
        preferredCurrency: "KES",
        password: "SuperSecretPassword123",
        confirmPassword: "SuperSecretPassword123",
      };
      const result = SignupSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const mismatched = {
        fullName: "Amina Mwangi",
        email: "amina@Useaimly.finance",
        preferredCurrency: "KES",
        password: "SuperSecretPassword123",
        confirmPassword: "DifferentPassword456",
      };
      const result = SignupSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
      }
    });

    it("rejects passwords shorter than 8 characters", () => {
      const short = {
        fullName: "Amina Mwangi",
        email: "amina@Useaimly.finance",
        preferredCurrency: "KES",
        password: "short",
        confirmPassword: "short",
      };
      const result = SignupSchema.safeParse(short);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });
  });

  describe("ForgotPasswordSchema", () => {
    it("accepts valid email for recovery", () => {
      const valid = { email: "recovery@Useaimly.finance" };
      expect(ForgotPasswordSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects empty or invalid email", () => {
      expect(ForgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
      expect(ForgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
    });
  });

  describe("ResetPasswordSchema", () => {
    it("accepts valid matching reset passwords", () => {
      const valid = {
        password: "NewStrongPassword99!",
        confirmPassword: "NewStrongPassword99!",
      };
      expect(ResetPasswordSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects mismatched reset passwords", () => {
      const mismatched = {
        password: "NewStrongPassword99!",
        confirmPassword: "SomethingElseEntirely",
      };
      const result = ResetPasswordSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
    });
  });
});
