type MatrixOption<T extends string> = { value: T; label?: string };
type MatrixAxis<T extends string> = { label: string; options: MatrixOption<T>[] };

/** Create a matrix axis from a label and values. */
export const axis = <T extends string>(label: string, ...values: T[]): MatrixAxis<T> => ({
  label,
  options: values.map((value) => ({ value })),
});
