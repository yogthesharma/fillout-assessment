export function classNames(
  ...args: (string | false | null | undefined | Record<string, boolean>)[]
): string {
  return args
    .flatMap((arg) => {
      if (!arg) return [];
      if (typeof arg === "string") return [arg];
      if (typeof arg === "object") {
        return (
          Object.entries(arg)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, value]) => value)
            .map(([key]) => key)
        );
      }
      return [];
    })
    .join(" ");
}
