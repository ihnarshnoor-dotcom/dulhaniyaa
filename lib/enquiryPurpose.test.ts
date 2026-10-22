import { describe, expect, it } from "vitest";
import { enquirySubject, isPurpose, purposeFromParams, purposeLabel, vendorService } from "./enquiryPurpose";

describe("purposeFromParams", () => {
  it("uses a valid ?purpose", () => {
    expect(purposeFromParams("vendor:decor", null)).toBe("vendor:decor");
  });
  it("falls back to package when a package was picked, else wedding", () => {
    expect(purposeFromParams(null, "Gold")).toBe("package");
    expect(purposeFromParams("vendor:fireworks", null)).toBe("wedding");
    expect(purposeFromParams(null, null)).toBe("wedding");
  });
});

describe("purposes", () => {
  it("knows every vendor service and the general options", () => {
    expect(isPurpose("vendor:pandit")).toBe(true);
    expect(isPurpose("vendor:other")).toBe(true);
    expect(isPurpose("other")).toBe(true);
    expect(isPurpose("vendor:")).toBe(false);
    expect(purposeLabel("vendor:decor")).toBe("Vendor partner: Décor");
    expect(vendorService("wedding")).toBeNull();
    expect(vendorService("vendor:other")).toBe("Several or other services");
  });
});

describe("enquirySubject", () => {
  const base = { name: "Aman Verma", eventDate: "2027-02-14" };
  it("keeps the original wording for weddings", () => {
    expect(enquirySubject({ ...base, purpose: "wedding" })).toBe("New wedding enquiry: Aman Verma (2027-02-14)");
  });
  it("names the service for vendors", () => {
    expect(enquirySubject({ ...base, purpose: "vendor:decor" })).toBe("New vendor partnership enquiry: Aman Verma (Décor)");
  });
  it("labels packages and other enquiries", () => {
    expect(enquirySubject({ ...base, purpose: "package" })).toBe("New package enquiry: Aman Verma (2027-02-14)");
    expect(enquirySubject({ ...base, purpose: "other" })).toBe("New enquiry: Aman Verma");
  });
});
