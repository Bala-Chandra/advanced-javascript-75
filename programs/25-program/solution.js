// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export async function settleAll(iterable) {
  const values = Array.from(iterable);

  const results = new Array(values.length);

  await Promise.all(
    values.map((value, index) =>
      Promise.resolve(value).then(
        fulfilled => {
          results[index] = {
            status: "fulfilled",
            value: fulfilled
          };
        },
        reason => {
          results[index] = {
            status: "rejected",
            reason
          };
        }
      )
    )
  );

  return results;
}
