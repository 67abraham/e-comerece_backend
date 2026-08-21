import {betterAuth, string} from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import crypto from 'crypto'
import { sendEmail } from './sendEmail'

export const auth = betterAuth({
    database: prismaAdapter(prisma,{
        provider: "mongodb" 
        
    }),

    advanced:{
        database:{
            generateId: ()=>{
                return crypto.randomBytes(12).toString("hex")
            }
        }
    },

    account:{
        accountLinking:{
            enabled: true
        }
    },

    emailAndPassword:{
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: true
    },
    
    socialProviders: { 
        google: { 
        clientId: process.env.GOOGLE_CLIENT_ID as string, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
  }, 
  
  emailVerification: {
    sendVerificationEmail: async ( { user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        message: `Click the link to verify your email: ${url}`,
      });
    },
  },

  user:{
    additionalFields:{
        role:{
            type: "string",
            required:false
             
        }
    }
  }
})