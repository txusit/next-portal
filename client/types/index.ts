export interface IUser {
  _id?: string
  email: string
  fullName: string
  // TODO: add additional fields like: EID, graduation year, college, role, etc
}

export interface LoginUserParams {
  email: string
  password: string
}
