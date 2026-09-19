import { BadRequestException } from '@nestjs/common';

export const MAX_CODE_LENGTH = 20_000;

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertValidCode(code: unknown): boolean {
    if (typeof code !== 'string') throw new BadRequestException('code must be a string');
    if (code.length > MAX_CODE_LENGTH) {
        throw new BadRequestException(`code exceeds the maximum length of ${MAX_CODE_LENGTH} characters`);
    }
    return code.trim() === '';
}
