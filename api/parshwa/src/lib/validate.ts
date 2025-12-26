import { validate as classValidtor } from "class-validator";

export async function validate(obj: Object): Promise<string | null> {
  const errors = await classValidtor(obj);
  if (errors.length > 0) {
    return errors
      .map((e) => {
        const constraints = e.constraints ?? {};
        return Object.keys(constraints)
          .map((c) => constraints[c])
          .join("\n");
      })
      .join("\n");
  }
  return null;
}
