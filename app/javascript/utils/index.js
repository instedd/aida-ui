// convenience wrapper to debounce thunks, for use with redux-debounced
export const debounced = (key, time = 1000) => {
  return thunk => {
    thunk.meta = {debounce: {time, key}}
    return thunk
  }
}
