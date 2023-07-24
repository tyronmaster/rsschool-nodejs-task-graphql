import { GraphQLObjectType, GraphQLList } from "graphql";
import { FastifyInstance } from "fastify";

export const gqlMutationTypes = new GraphQLObjectType({
    name: 'MutationType',
    fields: {},
})