import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "../../../lib/db";
import crypto from 'crypto';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { username, password } = credentials;
          
          // Never store plain-text passwords! This is just for demonstration
          // In production, you should hash the password and compare hashes
          const [rows] = await pool.query(
            "SELECT * FROM admin WHERE username = ?",
            [username]
          );

          if (rows.length === 0) {
            return null;
          }

          const admin = rows[0];
          
          // Compare passwords (replace with proper password hashing in production)
          if (admin.password === password) {
            return {
              id: admin.id,
              username: admin.username,
              // Add any other user data you want to include in the session
            };
          }
          
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});