import axios from 'axios'
import { FastifyInstance } from 'fastify'

interface QueryParams {
  url: string
}

export const proxyRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/proxy/image', async (request, reply) => {
    const { url } = request.query as QueryParams
    if (!url) {
      reply.status(400).send({ error: 'URL parameter is required' })
      return
    }

    const decodedUrl = decodeURIComponent(url)
    const urlObj = new URL(decodedUrl)
    const allowedDomains = ['mangadex.org', 'mangadex.network']

    if (!allowedDomains.some((domain) => urlObj.hostname.includes(domain))) {
      reply.status(400).send({ error: 'Invalid URL domain' })
      return
    }

    try {
      const response = await axios.get(decodedUrl, {
        responseType: 'stream',
      })

      reply.header('Content-Type', response.headers['content-type'])
      reply.header('Cache-Control', 'public, max-age=31536000')

      return response.data
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch image' })
    }
  })
}
