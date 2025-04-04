export function seperate<T>(
  before: T[],
  after: T[],
  matcher: (a: T, b: T) => boolean,
): { additions: T[]; removals: T[]; remaining: T[] } {
  const retVal: { additions: T[]; removals: T[]; remaining: T[] } = {
    // TODO: better array copy?
    additions: [...after],
    removals: [...before],
    remaining: [],
  };
  before.forEach((item) => {});

  return retVal;
}
