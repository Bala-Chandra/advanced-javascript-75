// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function promisify(fn) {
    return function (...args) {
        return new Promise((resolve, reject) =>{
            fn.call(this, ...args, ( err, result) => {
                if (err) {
                    reject(err)
                } 
                    resolve(result)
            })
        })
    }
}