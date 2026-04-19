import { BadRequestException } from '@nestjs/common';

/** 24-char hex MongoDB ObjectId string (for query params and DTO `@Matches`). */
export const OBJECT_ID_HEX_PATTERN = /^[a-fA-F0-9]{24}$/;

/** Returns undefined if absent/empty; throws 400 if present but not a 24-char hex ObjectId string. */
export function parseOptionalCategoryId(raw?: string): string | undefined {
  if (raw === undefined || raw === '') return undefined;
  if (!OBJECT_ID_HEX_PATTERN.test(raw)) {
    throw new BadRequestException('Invalid category_id');
  }
  return raw;
}
