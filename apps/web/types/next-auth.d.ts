// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * When using the Credentials Provider the user object is the
   * response returned from the authorize callback
   */
  interface User extends DefaultUser {
    evmAddress: string;
    imageUrl: string;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on
   * the `SessionProvider` React Context
   */
  interface Session {
    user: {} & User;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    evmAddress: string;
  }
}
