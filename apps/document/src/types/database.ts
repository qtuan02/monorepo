/**
 * Database type definitions
 */

/**
 * Represents an allowed email in the database
 */
export interface AllowedEmail {
  email: string;
  password?: string;
  active: boolean;
}

