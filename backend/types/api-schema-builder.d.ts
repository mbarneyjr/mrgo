declare module 'api-schema-builder' {
  export type OpenapiSpec = Record<string, unknown>

  type ParametersValidatorOptions = {
    query: Record<string, string | number | boolean>
    headers: Record<string, string | number | boolean>
    path: string
  }
  function ValidateParameters(options: ParametersValidatorOptions): booelan
  function ValidateBody(options: string | number | boolean | object | undefined): booelan

  export type ParameterValidationError = {
    message: string,
    dataPath: string,
    params: Record<string, unknown>,
  }

  export type BodyValidationError = {
    message: string,
    dataPath: string,
    params: Record<string, unknown>,
  }

  export type Validator = {
    [path: string]: {
      [method: string]: {
        parameters: {
          validate: ValidateParameters,
          errors: Array<ParameterValidationError>,
        },
        body: {
          validate: ValidateBody,
          errors: Array<BodyValidationError>,
        },
      },
    },
  }

  export function buildSchemaSync(spec: OpenapiSpec): Validator;
}
