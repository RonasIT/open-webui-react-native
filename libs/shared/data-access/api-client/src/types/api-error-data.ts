type DetailData = Array<{
  loc: Array<string | number>;
  msg: string;
  type: string;
}>;

export type ApiErrorData = {
  detail?: string | DetailData;
};

// NOTE: Open WebUI uses this exact detail for a completion model missing from its registry
// and for a workspace model whose base model is gone (0.10.0 through 0.13.3).
export const modelNotFoundDetail = 'Model not found';
