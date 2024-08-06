import { expect, test, vi } from "vitest";

import { validateTicket } from "../cas/cas-client";

global.fetch = vi.fn();

const mockValidTicketResponse = `
<cas:serviceResponse>
  <cas:authenticationSuccess>
    <cas:user>testuser</cas:user>
  </cas:authenticationSuccess>
</cas:serviceResponse>
`;

const mockInvalidTicketResponse = `
<cas:serviceResponse>
  <cas:authenticationFailure>
    <cas:code>INVALID_TICKET</cas:code>
  </cas:authenticationFailure>
</cas:serviceResponse>
`;
const mockInvalidServiceResponse = `
<cas:serviceResponse>
  <cas:authenticationFailure code='INVALID_SERVICE'>
    Ticket &#039;ST-XXXX-XXXXXXX-cas01.example.org&#039; no coincide con el servicio proporcionado. El servicio original era &#039;http://localhost:3000/api/auth/callback/cas&#039; y el servicio proporcionado era &#039;http://localhost:3000/api/callback/cas&#039;.
</cas:authenticationFailure>
</cas:serviceResponse>
`;

test("validateTicket should return user object if ticket is valid", async () => {
  const mockTicket = "ST-XXXX-XXXXXXX-cas01.example.org";

  (fetch as any).mockResolvedValue({
    ok: true,
    text: async () => mockValidTicketResponse,
  });

  const user = await validateTicket(mockTicket);
  expect(user).toEqual({ id: "testuser" });
});

test("validateTicket should return null if ticket is invalid", async () => {
  const mockTicket = "ST-XXXX-XXXXXXX-cas01.example.org";

  (fetch as any).mockResolvedValue({
    ok: true,
    text: async () => mockInvalidTicketResponse,
  });

  const user = await validateTicket(mockTicket);
  expect(user).toBeNull();
});

test("validateTicket should handle network errors gracefully", async () => {
  const mockTicket = "ST-XXXX-XXXXXXX-cas01.example.org";

  (fetch as any).mockRejectedValue(new Error("Network error"));

  const user = await validateTicket(mockTicket);
  expect(user).toBeNull();
});
