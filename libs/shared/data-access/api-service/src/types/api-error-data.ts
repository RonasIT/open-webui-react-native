type DetailData = Array<{
  loc: Array<string | number>;
  msg: string;
  type: string;
}>;

export type ApiErrorData = {
  detail?: string | DetailData;
};
