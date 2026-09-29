import { z } from "zod";
import { EVM_ADDRESS_REGEX, PIN_MAX, PIN_MIN, USERNAME_MAX, USERNAME_MIN } from "./constants";

export const usernameSchema = z
  .string()
  .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
  .max(USERNAME_MAX, `Username must be at most ${USERNAME_MAX} characters`)
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const pinSchema = z
  .string()
  .min(PIN_MIN, `PIN must be at least ${PIN_MIN} digits`)
  .max(PIN_MAX, `PIN must be at most ${PIN_MAX} characters`)
  .regex(/^[0-9]+$/, "PIN must contain only numbers");

export const walletSchema = z
  .string()
  .regex(EVM_ADDRESS_REGEX, "Invalid EVM wallet address (must be 0x + 40 hex chars)")
  .transform((v) => v.toLowerCase());

export const registerSchema = z.object({
  username: usernameSchema,
  walletAddress: walletSchema,
  pin: pinSchema,
});

export const loginSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});

export const gameSubmitSchema = z.object({
  runId: z.string().min(1),
  height: z.number().int().min(0).max(500000),
  duration: z.number().int().min(0),
  acorns: z.number().int().min(0).max(100000),
  goldenAcorns: z.number().int().min(0).max(1000).optional().default(0),
  platformsLanded: z.number().int().min(0).optional(),
  enemiesHit: z.number().int().min(0).optional(),
  maxJumpHeight: z.number().int().min(0).optional(),
  clientSeed: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export function normalizeWallet(address: string): string {
  return address.trim().toLowerCase();
}
