/* eslint-disable */
// @ts-nocheck
// [ ] compatibilidad con eslint y ts-check
import { expect, test, vi } from "vitest";

import { validateTicket } from "../cas/cas-client";

global.fetch = vi.fn();

const mockServiceURL = "https://dict.uci.cu/api/auth/callback/cas";
const mockTicket = "ST-XXXX-XXXXXXX-cas01.example.org";
const encodeServiceURL = encodeURIComponent(mockServiceURL);
const casURL = `https://soa-cas.uci.cu/cas/serviceValidate?service=${encodeServiceURL}&ticket=${mockTicket}`;
const mockInvalidServiceURL =
  "http://invalid.service.url/api/auth/callback/cas";

const mockParams = {
  ticket: mockTicket,
  serviceURL: mockServiceURL,
};

const mockLog = {
  serviceURL: mockServiceURL,
  encodeServiceURL: encodeURIComponent(mockServiceURL),
  casURL: casURL,
};

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
  Ticket &#039;ST-XXXX-XXXXXXX-cas01.example.org&#039; no coincide con el servicio proporcionado. El servicio original era &#039;${mockServiceURL}&#039; y el servicio proporcionado era &#039;${mockInvalidServiceURL}&#039;.
</cas:authenticationFailure>
</cas:serviceResponse>
`;

test("validateTicket debería retornar un objeto de user si el ticket es válido", async () => {
  (fetch as any).mockResolvedValue({
    ok: true,
    text: async () => mockValidTicketResponse,
  });

  const user = await validateTicket(mockParams);
  expect(user).toEqual({ id: "testuser" });
});

test("validateTicket debería manejar el error si el ticket es inválido", async () => {
  const consoleErrorSpy = vi.spyOn(console, "error");
  const consoleLogSpy = vi.spyOn(console, "log");

  (fetch as any).mockResolvedValue({
    ok: true,
    text: async () => mockInvalidTicketResponse,
  });

  const user = await validateTicket(mockParams);
  expect(user).toBeNull();
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Error validating CAS ticket:",
    new Error(mockInvalidTicketResponse),
  );
  expect(consoleLogSpy).toHaveBeenCalledWith(mockLog);

  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

test("validateTicket debería manejar el error si el servicio original no coincide con el servicio proporcionado", async () => {
  const consoleErrorSpy = vi.spyOn(console, "error");
  const consoleLogSpy = vi.spyOn(console, "log");

  (fetch as any).mockResolvedValue({
    ok: true,
    text: async () => mockInvalidServiceResponse,
  });

  const user = await validateTicket(mockParams);
  expect(user).toBeNull();
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Error validating CAS ticket:",
    new Error(mockInvalidServiceResponse),
  );

  expect(consoleLogSpy).toHaveBeenCalledWith(mockLog);

  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

test("validateTicket debería manejar el error si response.ok es falso", async () => {
  const consoleErrorSpy = vi.spyOn(console, "error");
  const consoleLogSpy = vi.spyOn(console, "log");

  (fetch as any).mockResolvedValue({
    ok: false,
  });

  const user = await validateTicket(mockParams);
  expect(user).toBeNull();
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Error validating CAS ticket:",
    new Error("Network response was not ok"),
  );
  expect(consoleLogSpy).toHaveBeenCalledWith(mockLog);

  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

test("validateTicket debería manejar los errores de red", async () => {
  const consoleErrorSpy = vi.spyOn(console, "error");
  const consoleLogSpy = vi.spyOn(console, "log");

  (fetch as any).mockRejectedValue(new Error("Network error"));

  const user = await validateTicket(mockParams);
  expect(user).toBeNull();
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Error validating CAS ticket:",
    new Error("Network error"),
  );
  expect(consoleLogSpy).toHaveBeenCalledWith(mockLog);

  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});
