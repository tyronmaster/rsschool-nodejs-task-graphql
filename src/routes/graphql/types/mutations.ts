/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { GraphQLObjectType, GraphQLFloat, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull, GraphQLNullableType } from "graphql";
import { UUIDType } from "../types/uuid.js";
import { enumMemberId, posts, profiles, user } from "./queries.js";

export const profileDTO = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: enumMemberId },
  }
})
export const userDTO = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: UUIDType },
    balance: { type: GraphQLFloat },
  }
})

export const postDTO = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    authorId: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }
})

export const changePostDTO = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }
})

export const changeProfileDTO = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: enumMemberId },
  }
})

export const changeUserDTO = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: UUIDType },
    balance: { type: GraphQLFloat },
  }
})


export const delet = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    authorId: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }
})

export const gqlMutationTypes = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    //create post
    createPost: {
      type: posts,
      args: {
        dto: { type: new GraphQLNonNull(postDTO) }
      },
      resolve: (obj, args, ctx) => {
        return ctx.prisma.post.create({
          data: args.dto,
        });
      }
    },
    //create user
    createUser: {
      type: user,
      args: {
        dto: { type: new GraphQLNonNull(userDTO) }
      },
      resolve: (obj, args, ctx) => {
        return ctx.prisma.user.create({
          data: args.dto,
        });
      }
    },
    //create profile
    createProfile: {
      type: profiles,
      args: {
        dto: { type: new GraphQLNonNull(profileDTO) }
      },
      resolve: (obj, args, ctx) => {
        return ctx.prisma.profile.create({
          data: args.dto,
        });
      }
    },
    //delete post
    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: UUIDType }
      },
      resolve: async (obj, args, ctx) => {

        const deletePost = await ctx.prisma.post.delete({
          where: {
            id: args.id,
          },
        });

        return deletePost ? true : false
      }
    },
    //delete profile
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: UUIDType }
      },
      resolve: async (obj, args, ctx) => {
        const deleteProfile = await ctx.prisma.profile.delete({
          where: {
            id: args.id,
          },
        });
        return deleteProfile ? true : false
      }
    },
    //delete user
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: UUIDType }
      },
      resolve: async (obj, args, ctx) => {
        const deleteUser = await ctx.prisma.user.delete({
          where: {
            id: args.id,
          },
        })

        return deleteUser ? true : false
      }
    },
    //update post
    changePost: {
      type: posts,
      args: {
        id: { type: UUIDType },
        dto: { type: changePostDTO }
      },
      resolve: async (obj, args, ctx) => {
        return await ctx.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
      }
    },
    //update profile
    changeProfile: {
      type: profiles,
      args: {
        id: { type: UUIDType },
        dto: { type: changeProfileDTO }
      },
      resolve: async (obj, args, ctx) => {
        return await ctx.prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        });
      }
    },
    //update user
    changeUser: {
      type: user,
      args: {
        id: { type: UUIDType },
        dto: { type: changeUserDTO }
      },
      resolve: async (obj, args, ctx) => {
        return await ctx.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      }
    },
    //subscribe to
    subscribeTo: {
      type: user,
      args: {
        userId: { type: UUIDType },
        authorId: { type: UUIDType },
      },
      resolve: async (obj, args, ctx) => {
        return await ctx.prisma.user.update({
          where: {
            id: args.userId,
          },
          data: {
            userSubscribedTo: {
              create: {
                authorId: args.authorId,
              },
            },
          },
        });
      }
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: UUIDType },
        authorId: { type: UUIDType },
      },
      resolve: async (obj, args, ctx) => {
        const deletedUser = await ctx.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        });
        return deletedUser ? true : false
      }
    }

  }
})

