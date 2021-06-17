import { scrypt, randomBytes } from 'crypto'
//need to use promisify because scrypt is callback based method
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

export class Password {
    //can access static methods without an instance to the class
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex')
        const buf = (await scryptAsync(password, salt, 64)) as Buffer //tell ts that it is a buffer

        return `${buf.toString('hex')}.${salt}`
    }

    static async compare(storedPassword: string, suppliedPassword: string) {
        const [hashedPassword, salt] = storedPassword.split('.')
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer

        return buf.toString('hex') === hashedPassword
    }
}