/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyInstance } from "fastify";
import { GraphQLList, GraphQLObjectType, GraphQLFloat, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLEnumType } from "graphql";
import { UUIDType } from "../types/uuid.js";

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

export const memberResponse = new GraphQLObjectType({
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
      type: memberResponse,
      resolve: async (obj, args, ctx: FastifyInstance) => {
        const memberType = await ctx.prisma.memberType.findUnique({
          where: {
            id: obj.memberTypeId
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
      resolve: async (obj, args, ctx: FastifyInstance) => {
        const profile = await ctx.prisma.profile.findUnique({
          where: {
            userId: obj.id
          }
        })
        return profile ? profile : null
      }
    },
    posts: {
      type: new GraphQLList(posts),
      resolve: async (obj, args, ctx: FastifyInstance) => {
        return await ctx.prisma.post.findMany({
          where: {
            authorId: obj.id
          }
        })
      }
    },
    subscribedToUser: {
      type: new GraphQLList(user),
      resolve: async (obj, args, ctx) => {
        return await ctx.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: obj.id,
              },
            },
          },
        });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(user),
      resolve: async (obj, args, ctx) => {
        return await ctx.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: obj.id,
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
      type: new GraphQLList(memberResponse),
      resolve: async (_, _2, ctx: FastifyInstance) => await ctx?.prisma?.memberType.findMany()
    },
    //get profiles
    profiles: {
      type: new GraphQLList(profiles),
      resolve: async (_, _2, ctx: FastifyInstance) => await ctx?.prisma?.profile?.findMany()
    },
    //get posts
    posts: {
      type: new GraphQLList(posts),
      resolve: async (_, _2, ctx: FastifyInstance) => await ctx?.prisma?.post?.findMany()
    },
    //get users
    users: {
      type: new GraphQLList(user),
      resolve: async (_, _2, ctx: FastifyInstance) => await ctx?.prisma?.user?.findMany()
    },
    //get member-types by id
    memberType: {
      type: memberResponse,
      args: { id: { type: enumMemberId } },
      resolve: async (_, args, ctx: FastifyInstance) => {
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
    //get profile by id
    profile: {
      type: profiles,
      args: { id: { type: UUIDType } },
      resolve: async (_, args, ctx: FastifyInstance) => {
        const profile = await ctx.prisma.profile.findUnique({
          where: {
            id: args.id
          }
        })

        return profile ? profile : null
      }

    },
    //get post by id
    post: {
      type: posts,
      args: { id: { type: UUIDType } },
      resolve: async (_, args, ctx: FastifyInstance) => {
        const post = await ctx.prisma.post.findUnique({
          where: {
            id: args.id
          }
        })

        return post ? post : null
      }
    },
    //get user by id
    user: {
      type: user,
      args: { id: { type: UUIDType } },
      resolve: async (_, args, ctx: FastifyInstance) => {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: args.id
          }
        })

        return user ? user : null
      }
    }
  }
})

