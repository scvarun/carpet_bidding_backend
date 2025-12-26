import { MiddlewareFn } from "type-graphql";

export const ResolveTimeMiddleware: MiddlewareFn = async (
  { info, context },
  next
) => {
  const start = Date.now();
  await next();
  const resolveTime = Date.now() - start;
  console.log(`${info.parentType.name}.${info.fieldName} [${resolveTime} ms]`);
};

export const measureRequestDuration = (req, res, next) => {
  const start = Date.now();
  res.once("finish", () => {
    const duration = Date.now() - start;
    console.log(
      "Time taken to process " + req.originalUrl + " is: " + duration
    );
  });
  next();
};
