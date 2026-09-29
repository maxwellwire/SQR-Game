import {
  MAX_HEIGHT_HARD_CAP,
  MAX_REASONABLE_HEIGHT_PER_SECOND,
  MAX_RUN_DURATION_MS,
  MIN_RUN_DURATION_MS,
} from "./constants";

export type ValidationResult = {
  status: "VALIDATED" | "FLAGGED" | "REJECTED";
  reason?: string;
};

export function validateRun(input: {
  height: number;
  duration: number; // ms
  acorns: number;
  goldenAcorns?: number;
  platformsLanded?: number;
  previousBest?: number;
  startedAt: Date;
  endedAt: Date;
}): ValidationResult {
  const { height, duration, acorns, platformsLanded, startedAt, endedAt } = input;

  // Hard caps
  if (height < 0 || height > MAX_HEIGHT_HARD_CAP) {
    return { status: "REJECTED", reason: "Height outside allowed range" };
  }

  if (duration < MIN_RUN_DURATION_MS) {
    return { status: "REJECTED", reason: "Run duration too short" };
  }

  if (duration > MAX_RUN_DURATION_MS) {
    return { status: "REJECTED", reason: "Run duration too long" };
  }

  // Timestamp consistency
  const actualDuration = endedAt.getTime() - startedAt.getTime();
  if (Math.abs(actualDuration - duration) > 5000) {
    return { status: "FLAGGED", reason: "Client duration mismatch with server timestamps" };
  }

  // Physical plausibility: height vs time
  const durationSec = duration / 1000;
  const maxPossible = durationSec * MAX_REASONABLE_HEIGHT_PER_SECOND;
  if (height > maxPossible * 1.15) {
    return {
      status: "REJECTED",
      reason: `Height ${height}m exceeds max plausible ${Math.floor(maxPossible)}m for ${durationSec.toFixed(1)}s`,
    };
  }

  if (height > maxPossible * 0.95) {
    return {
      status: "FLAGGED",
      reason: `Height near theoretical maximum (${height}m / ${Math.floor(maxPossible)}m)`,
    };
  }

  // Acorns vs height heuristic
  if (acorns > 0 && height > 0) {
    const acornsPerMeter = acorns / height;
    if (acornsPerMeter > 0.2) {
      return { status: "FLAGGED", reason: "Unusually high acorn density" };
    }
  }

  // Platforms heuristic
  if (platformsLanded !== undefined && platformsLanded > 0) {
    const avgPlatformGap = height / platformsLanded;
    if (avgPlatformGap < 8) {
      return { status: "FLAGGED", reason: "Platform landing density unusually high" };
    }
  }

  // Extreme jumps from zero
  if (height > 50000 && durationSec < 600) {
    return { status: "FLAGGED", reason: "Extremely high score in short time" };
  }

  return { status: "VALIDATED" };
}
