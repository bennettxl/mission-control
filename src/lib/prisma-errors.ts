import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export function isMissingTableError(error: unknown): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022");
}
