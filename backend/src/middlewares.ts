import { FastifyRequest } from 'fastify'
import prisma from './prisma.js'
import { TOKEN_DURATION } from './utils.js'

export const loginMiddleware = async (request: FastifyRequest) => {
  if (
    request.routerPath === '/login' ||
    request.routerPath === '/refreshToken'
  ) {
    return
  }

  if (request.headers.authorization === undefined) {
    return
  }

  const currentToken = request.headers.authorization.replace('Bearer ', '')

  const databaseToken = await prisma.token.findUnique({
    where: {
      token: currentToken,
    },
  })

  if (!databaseToken) {
    throw new Error('Token not found')
  }

  const now = new Date()
  const updatedAt = new Date(databaseToken.updatedAt)
  const isTokenIssuedMoreThan15MinutsAgo =
    now.getTime() - updatedAt.getTime() > TOKEN_DURATION * 1000

  if (isTokenIssuedMoreThan15MinutsAgo) {
    throw new Error('Token expired')
  }
}
