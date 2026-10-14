// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function updateUserCity(state, city) {
  return {
    ...state,
    user: {
      ...state.user,
      address: {
        ...state.user.address,
        city
      }
    }
  };
}

export const solve = updateUserCity;
