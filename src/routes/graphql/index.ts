import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, gqlSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const errors =
        validate(gqlSchema, parse(String(req.body.query)),
          [depthLimit(5)]);
      if (errors.length > 0) {
        return;
      }
      return await graphql({
        schema: gqlSchema,
        source: String(req.body.query),
        contextValue: fastify,
        variableValues: req.body.variables,
      });
    },
  });


};

export default plugin;
