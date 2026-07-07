import type { QueryOperatorResolver } from "@crudstack/core";

/**
 * The native condition type for Sanity.
 * Contains the GROQ string snippet and the parameters to be passed to the Sanity client.
 */
export type SanityCondition = {
    condition: string;
    params: Record<string, any>;
};

/**
 * Creates a Sanity-specific QueryOperatorResolver.
 * This maps core query operators (like $eq, $gt) to GROQ syntax.
 */
export function createSanityResolver(): QueryOperatorResolver<SanityCondition> {
    let paramIndex = 0;

    const createCondition = (operator: string, field: string, value: any): SanityCondition => {
        const key = `p${paramIndex++}`;
        return {
            condition: `${field} ${operator} $${key}`,
            params: { [key]: value },
        };
    };

    return {
        $eq: (field, value) => createCondition("==", field, value),
        $ne: (field, value) => createCondition("!=", field, value),
        $gt: (field, value) => createCondition(">", field, value),
        $gte: (field, value) => createCondition(">=", field, value),
        $lt: (field, value) => createCondition("<", field, value),
        $lte: (field, value) => createCondition("<=", field, value),
        $in: (field, value) => createCondition("in", field, value),
        $nin: (field, value) => {
            // GROQ doesn't have a direct 'not in' operator, we use !(field in value)
            const key = `p${paramIndex++}`;
            return {
                condition: `!(${field} in $${key})`,
                params: { [key]: value },
            };
        },
    };
}
