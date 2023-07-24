import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse, GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { gqlMutationTypes } from './types/mutations.js';
import { gqlQueryTypes } from './types/queries.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const { query, variables } = req.body
      const gqlSchema = new GraphQLSchema({
        query: gqlQueryTypes,
        mutation: gqlMutationTypes
      })

      const errors = validate(gqlSchema, parse(String(query)), [depthLimit(5)])
      if (errors.length > 0) {
        await reply.send({ data: null, errors: errors });
        return;
      }

      return await graphql({
        schema: gqlSchema,
        source: String(query),
        contextValue: fastify,
        variableValues: variables,
      })
    },
  });


};

export default plugin;
