import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);

const cache = new Map<object, ValidateFunction>();

/**
 * Validate data against a JSON Schema. Caches the compiled validator.
 * Returns { valid, errors } — never throws, so test assertions stay clean.
 */
export function validateSchema(
  schema: object,
  data: unknown
): { valid: boolean; errors: string[] } {
  let validate = cache.get(schema);
  if (!validate) {
    validate = ajv.compile(schema);
    cache.set(schema, validate);
  }

  const valid = validate(data);
  const errors = (validate.errors ?? []).map(
    (e) => `${e.instancePath} ${e.message}`
  );

  return { valid, errors };
}
