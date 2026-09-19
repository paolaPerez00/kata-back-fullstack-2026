import { Logger } from '@nestjs/common';

export type LogContext = Record<string, string | number | boolean | undefined>;

function format(operation: string, context: LogContext): string {
    const details = Object.entries(context)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
    return details ? `${operation} ${details}` : operation;
}


export async function logOperation<T>(
    logger: Logger,
    operation: string,
    context: LogContext,
    run: (context: LogContext) => Promise<T>,
): Promise<T> {
    const startedAt = Date.now();
    logger.log(`START ${format(operation, context)}`);
    try {
        const result = await run(context);
        logger.log(`END ${format(operation, { ...context, ms: Date.now() - startedAt })}`);
        return result;
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        logger.error(`ERROR ${format(operation, { ...context, ms: Date.now() - startedAt })} reason="${reason}"`);
        throw error;
    }
}
