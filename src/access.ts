import type { Access } from 'payload'

export const authenticated: Access = ({ req: { user } }) => Boolean(user)
export const published: Access = ({ req: { user } }) => user ? true : { status: { equals: 'published' } }
