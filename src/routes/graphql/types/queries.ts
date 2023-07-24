import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { FastifyInstance } from "fastify";
import { UUIDType } from "./uuid.js";

export const enumMemberTypeId = new GraphQLEnumType({
    name: "MemberTypeId",
    values: {
        basic: { value: "basic" },
        business: { value: "business" },
    }
})

export const memberTypeFields = new GraphQLObjectType({
    name: "MemberTypes",
    fields: {
        id: { type: enumMemberTypeId },
        discount: { type: GraphQLFloat },
        postsLimitPerMonth: { type: GraphQLInt }
    }
});



export const gqlQueryTypes = new GraphQLObjectType({
    name: "QueryType",
    fields: {
        //get member-types
        memberTypes: {
            type: new GraphQLList(memberTypeFields),
            resolve: async (_parent, _args, { prisma }: FastifyInstance) => await prisma?.memberType.findMany()
        },
    }
})