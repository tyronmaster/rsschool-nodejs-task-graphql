/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyInstance } from "fastify";
import { GraphQLList, GraphQLObjectType, GraphQLFloat, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLEnumType } from "graphql";
import { UUIDType } from "./uuid.js";

export const enumMemberId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: 'basic'
    },
    business: {
      value: 'business'
    }
  }
})

export const memberIdTypes = new GraphQLObjectType({
  name: "MemberTypes",
  fields: {
    id: { type: enumMemberId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }
})

export const profiles = new GraphQLObjectType({
  name: "Profiles",
  fields: {
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: enumMemberId },
    memberType: {
      type: memberIdTypes,
      resolve: async (parent, _args, ctx: FastifyInstance) => {
        const memberType = await ctx.prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId
          }
        })
        if (!memberType) {
          throw ctx.httpErrors.notFound()
        }
        return memberType
      }
    },
  }
})

export const posts = new GraphQLObjectType({
  name: "Posts",
  fields: {
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }
})

export const subscribed = new GraphQLObjectType({
  name: "subscribedToUser",
  fields: {
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }
})

export const user = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: profiles,
      resolve: async (parent, _args, { prisma }: FastifyInstance) => {
        const profile = await prisma.profile.findUnique({
          where: {
            userId: parent.id
          }
        })
        return profile ? profile : null
      }
    },
    posts: {
      type: new GraphQLList(posts),
      resolve: async (parent, _args, ctx: FastifyInstance) => {
        return await ctx.prisma.post.findMany({
          where: {
            authorId: parent.id
          }
        })
      }
    },
    subscribedToUser: {
      type: new GraphQLList(user),
      resolve: async (parent, _args, ctx) => {
        return await ctx.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(user),
      resolve: async (parent, _args, ctx) => {
        return await ctx.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        });
      }
    }
  })
})

export const gqlQueryTypes = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    //get member-types
    memberTypes: {
      type: new GraphQLList(memberIdTypes),
      resolve: async (_parent, _args, { prisma }: FastifyInstance) => await prisma?.memberType.findMany()
    },
    //get member-types by id
    memberType: {
      type: memberIdTypes,
      args: { id: { type: enumMemberId } },
      resolve: async (_parent, args, ctx: FastifyInstance) => {
        const memberType = await ctx.prisma.memberType.findUnique({
          where: {
            id: args.id
          }
        })
        if (!memberType) {
          throw ctx.httpErrors.notFound()
        }
        return memberType
      }
    },
    //get posts
    posts: {
      type: new GraphQLList(posts),
      resolve: async (_parent, _args, { prisma }: FastifyInstance) => await prisma?.post?.findMany()
    },
    //get post by id
    post: {
      type: posts,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, args, { prisma }: FastifyInstance) => {
        const post = await prisma.post.findUnique({
          where: {
            id: args.id
          }
        })

        return post ? post : null
      }
    },
    //get profiles
    profiles: {
      type: new GraphQLList(profiles),
      resolve: async (_parent, _args, { prisma }: FastifyInstance) => await prisma?.profile?.findMany()
    },
    //get profile by id
    profile: {
      type: profiles,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, args, { prisma }: FastifyInstance) => {
        const profile = await prisma.profile.findUnique({
          where: {
            id: args.id
          }
        })
        return profile ? profile : null
      }
    },
    //get users
    users: {
      type: new GraphQLList(user),
      resolve: async (_parent, _args, { prisma }: FastifyInstance) => await prisma?.user?.findMany()
    },
    //get user by id
    user: {
      type: user,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, args, { prisma }: FastifyInstance) => {
        const user = await prisma.user.findUnique({
          where: {
            id: args.id
          }
        })
        return user ? user : null
      }
    }
  }
})

