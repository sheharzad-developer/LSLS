import { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "@/types/role"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Trim and lowercase email for consistent lookup
          const email = credentials.email.trim().toLowerCase()

          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          })

          if (!user) {
            console.error("User not found:", email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.error("Invalid password for user:", email)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          // Re-throw to see the actual error in Vercel logs
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as unknown as Role
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

