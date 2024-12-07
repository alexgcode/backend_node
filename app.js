module.exports = async function application (app, opts) {
    app.get('/', async (request, reply) => {
      return { hello: 'world' }
    })
    
    await app.register(require('@fastify/env'), {
    schema: {
        type: 'object',
        properties: {
        PORT: { type: 'integer', default: 3000 },
        NODE_ENV: { type: 'string' },
        MONGO_URL: { type: 'string' }
        }
    }
    })

    app.register(require('@fastify/mongodb'), {
    url: app.config.MONGO_URL
    })
}
  