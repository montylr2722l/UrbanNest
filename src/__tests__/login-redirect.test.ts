import {
  getDefaultLoginDestination,
  getSafeCallbackDestination,
} from "@/lib/auth/login-redirect";

describe("login redirect helpers", () => {
  it.each([
    ["CUSTOMER", "/account"],
    ["SELLER", "/seller"],
    ["ADMIN", "/admin"],
  ])("routes %s to its default dashboard", (role, destination) => {
    expect(getDefaultLoginDestination(role)).toBe(destination);
  });

  it("does not choose a destination for an unknown or missing role", () => {
    expect(getDefaultLoginDestination("UNKNOWN")).toBeNull();
    expect(getDefaultLoginDestination(undefined)).toBeNull();
  });

  it("preserves same-origin callback URLs as local paths", () => {
    expect(
      getSafeCallbackDestination(
        "https://urbannest.example/products/shirt?color=blue#details",
        "https://urbannest.example",
      ),
    ).toBe("/products/shirt?color=blue#details");
    expect(getSafeCallbackDestination("/checkout?step=address", "https://urbannest.example"))
      .toBe("/checkout?step=address");
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "javascript:alert(1)",
    "/\\attacker.example/steal",
  ])("rejects unsafe callback URL %s", (callbackUrl) => {
    expect(getSafeCallbackDestination(callbackUrl, "https://urbannest.example")).toBeNull();
  });
});
