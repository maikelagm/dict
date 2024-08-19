import { headers } from "next/headers";
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
      const user = await validateTicket({
        ticket,
        serviceURL: `${headers().get("x-forwarded-proto") + "://" + headers().get("host")}/api/auth/callback/cas`,
      });
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

export async function validateTicket({
  ticket,
  serviceURL,
}: {
  ticket: any;
  serviceURL: string;
}): Promise<{ id: string } | null> {
  const encodeServiceURL = encodeURIComponent(serviceURL);
  const casURL = `https://soa-cas.uci.cu/cas/serviceValidate?service=${encodeServiceURL}&ticket=${ticket}`;

  try {
    const response = await fetch(casURL);
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
      throw new Error(`${text}`);
    }
  } catch (error) {
    console.error("Error validating CAS ticket:", error);
    console.log({
      serviceURL,
      encodeServiceURL,
      casURL,
    });
    return null;
  }
}

function parseCASResponse(response: string) {
  const regex = /<cas:user>([^<]+)<\/cas:user>/;
  const match = response.match(regex);
  return match ? match[1] : null;
}
