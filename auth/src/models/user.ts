import mongoose from 'mongoose'

import { Password } from '../utilities/password'

// An interface describing properties required to create a new user
interface UserAttrs {
    email: string
    password: string
}

// An interface describing properties an user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
    //build method returns us something of type UserDoc
}

// An interface describing user object can have other fields as well apart from user attrs. If we want to access those using ., we need to tell ts about them as well.
interface UserDoc extends mongoose.Document {
    email: string,
    password: string
    // createdAt: string, //uncomment if required
}

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    }
)

// this is a pre hook given to us by mongoose
userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed)
    }

    done()
})

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)
//model function returns us something of type UserModel

export { User }