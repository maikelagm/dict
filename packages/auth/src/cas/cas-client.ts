import Credentials from "@auth/core/providers/credentials";

import { extendUserObject } from "./users";

export const CAS = Credentials({
  id: "cas",
  name: "CAS-UCI",
  credentials: {
    ticket: {
      label: "ticket",
      placeholder: "ST-XXXX-XXXXXXX-cas01.example.org",
      type: "text",
    },
  },
  authorize: async (credentials) => {
    const ticket = credentials?.ticket;
    if (ticket) {
      const user = await validateTicket(ticket);
      if (user) {
        const extendedUser = await extendUserObject(user);
        return extendedUser;
      } else {
        return null;
      }
    } else {
      return null;
    }
  },
});

export async function validateTicket(ticket: any) {
  const serviceUrl = encodeURIComponent(
    `${process.env.NEXT_URL}/api/auth/callback/cas`,
  );
  const casUrl = `https://soa-cas.uci.cu/cas/serviceValidate?service=${serviceUrl}&ticket=${ticket}`;

  try {
    const response = await fetch(casUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const text = await response.text();
    const user = parseCASResponse(text);

    if (user) {
      return {
        id: user,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error validating CAS ticket:", error);
    return null;
  }
}

function parseCASResponse(response: string) {
  const regex = /<cas:user>([^<]+)<\/cas:user>/;
  const match = response.match(regex);
  return match ? match[1] : null;
}
