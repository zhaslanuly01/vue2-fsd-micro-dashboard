import { factory, nullable, primaryKey } from '@mswjs/data'

export const db = factory({
  user: {
    id: primaryKey(Number),
    email: String,
    password: String,
    name: String,
    surname: String,
    middle_name: String,
    organization_id: Number,
    avatar_url: nullable(String),
    role: String
  }
})
