export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface PersistedSession extends AuthSession {
  remember: boolean
}
