import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "../../../lib/db"; 

export default NextAuth({
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const { username, password } = credentials;
          
          const [admin] = await pool.query(
            "SELECT * FROM admin WHERE username = ? AND password = ?",
            [username, password]
          );
  
          if (admin.length) {
            return { id: admin[0].id, username: admin[0].username };
          } else {
            return null;
          }
        },
      }),
    ],
    session: {
      strategy: "jwt",  // Persist session via JWT by default
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
        session.user.id = token.id;
        session.user.username = token.username;
        return session;
      },
    },
    pages: {
      signIn: "/", // Redirect to custom login page if needed
    },
  });
  