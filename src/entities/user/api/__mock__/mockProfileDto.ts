import { usersMock } from '@/shared/lib/server'
import { UserDto } from '../user.dto.types'

export function mockProfileDto(initialProps: Partial<UserDto> = {}): UserDto {
  return {
    id: usersMock[0].id,
    email: usersMock[0].email,
    name: usersMock[0].name,
    surname: usersMock[0].surname,
    middle_name: usersMock[0].middle_name,
    organization_id: usersMock[0].organization_id,
    avatar_url: usersMock[0].avatar_url,
    role: usersMock[0].role,
    ...initialProps
  }
}
