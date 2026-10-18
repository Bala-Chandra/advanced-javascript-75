// Canonical original solution not yet available from the linked chat.
// Intentionally not fabricated. Paste the original here when provided.
export function createPerson(name, age){

    const person = {};

    Object.defineProperties(person, {
        name: {
            value: name,
            writable: false,
            enumerable: true,
            configurable: false 
        },

        age: {
            value: age,
            writable: false,
            enumerable: true,
        },

        description:{
            enumerable: true,
            get: function(){
                return `${this.name} is ${this.age} years old.`;
            }
        }

    });
    return person;
}
