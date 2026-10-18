// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function withLogger(fn, logger = console.log){
  return function(...args){
    logger("calling", fn.name, args)

    try{
      const result = fn.apply(this, args);
      logger("returned", result);
      return result
      
    }catch(error){
      logger("threw", error);
      throw error;
    }
  }
}
