import { NextResponse } from "next/server";

import { checkMongoConnection } from "~/libs/mongodb";

export async function GET() {
  try {
    const result = await checkMongoConnection();

    if (result.connected) {
      return NextResponse.json(
        {
          status: "connected",
          database: result.database,
          message: "MongoDB is connected and ready",
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          status: "disconnected",
          error: result.error,
          database: result.database,
          message: "MongoDB connection failed",
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to check MongoDB connection",
      },
      { status: 500 },
    );
  }
}
