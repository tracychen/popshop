import User from "@/models/User.model";
import alchemy from "./alchemy";

export async function getUserByAddress(
  ensOrAddress: string
): Promise<Partial<User>> {
  // Check if ENS or EVM address
  let address = ensOrAddress;
  if (address.endsWith(".eth")) {
    address = await alchemy.core.resolveName(address);
  }
  // TODO fetch user from backend by address
  const user = {};
  return user;
}
