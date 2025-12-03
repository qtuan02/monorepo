import type { AllowedEmail } from "~/types/database";
import { logger } from "~/utils/logger";
import { db } from "./mongodb";

/**
 * Checks if an email is allowed to sign in by querying the allowed_emails collection.
 * @param email - The email address to check
 * @returns Promise<boolean> - true if email exists and is active, false otherwise
 */
export async function checkEmailAllowed(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    logger.info("[checkEmailAllowed] Checking email", {
      email: normalizedEmail,
    });

    const collection = db.collection<AllowedEmail>("allowed_emails");

    // Check for active email with optimized single query
    const result = await collection.findOne(
      {
        email: normalizedEmail,
        active: true,
      },
      {
        projection: { _id: 1, email: 1, active: 1 },
      },
    );

    logger.info("[checkEmailAllowed] Active email result", {
      found: result !== null,
    });
    return result !== null;
  } catch (error) {
    logger.error("[checkEmailAllowed] Error checking allowed email", error);
    // In case of error, deny access for security
    return false;
  }
}
