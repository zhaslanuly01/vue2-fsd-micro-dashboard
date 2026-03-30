import usersMock from './__mocks__/users.json'
import { db } from './serverDb'

export function startDatabaseMigration() {
  const users = db.user.getAll()

  if (users.length > 0) {
    return
  }

  usersMock.forEach((user) => {
    db.user.create(user)
  })
}
