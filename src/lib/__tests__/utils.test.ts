import { describe, it, expect, beforeEach, vi } from "vitest";
import { cn, timeAgo, normalizeVietnamese } from "../utils";

describe("cn (className utility)", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2 py-1", "text-red-500")).toBe("px-2 py-1 text-red-500");
  });

  it("should handle conditional classes", () => {
    expect(cn("base-class", false && "conditional-class", "always-class")).toBe(
      "base-class always-class",
    );
    expect(cn("base-class", true && "conditional-class", "always-class")).toBe(
      "base-class conditional-class always-class",
    );
  });

  it("should merge conflicting Tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle empty and undefined inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn(undefined, null, "")).toBe("");
  });

  it("should handle arrays and objects", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe(
      "text-red-500",
    );
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should format recent dates correctly", () => {
    const oneHourAgo = new Date("2024-01-15T11:00:00Z");
    expect(timeAgo(oneHourAgo)).toBe("1 hour ago");

    const twoMinutesAgo = new Date("2024-01-15T11:58:00Z");
    expect(timeAgo(twoMinutesAgo)).toBe("2 minutes ago");
  });

  it("should format dates from days ago", () => {
    const threeDaysAgo = new Date("2024-01-12T12:00:00Z");
    expect(timeAgo(threeDaysAgo)).toBe("3 days ago");

    const oneWeekAgo = new Date("2024-01-08T12:00:00Z");
    expect(timeAgo(oneWeekAgo)).toBe("7 days ago");
  });

  it("should handle string dates", () => {
    const dateString = "2024-01-15T10:00:00Z";
    expect(timeAgo(dateString)).toBe("2 hours ago");
  });

  it("should handle very recent times", () => {
    const thirtySecondsAgo = new Date("2024-01-15T11:59:30Z");
    expect(timeAgo(thirtySecondsAgo)).toBe("30 seconds ago");
  });

  it("should handle future dates", () => {
    const futureDate = new Date("2024-01-15T13:00:00Z");
    expect(timeAgo(futureDate)).toBe("in 1 hour");
  });
});

describe("normalizeVietnamese", () => {
  it("should remove Vietnamese diacritics from lowercase text", () => {
    expect(normalizeVietnamese("á")).toBe("a");
    expect(normalizeVietnamese("à")).toBe("a");
    expect(normalizeVietnamese("ả")).toBe("a");
    expect(normalizeVietnamese("ã")).toBe("a");
    expect(normalizeVietnamese("ạ")).toBe("a");
  });

  it("should remove Vietnamese diacritics from uppercase text", () => {
    expect(normalizeVietnamese("Á")).toBe("a");
    expect(normalizeVietnamese("À")).toBe("a");
    expect(normalizeVietnamese("Ả")).toBe("a");
    expect(normalizeVietnamese("Ã")).toBe("a");
    expect(normalizeVietnamese("Ạ")).toBe("a");
  });

  it("should handle the đ character correctly", () => {
    expect(normalizeVietnamese("đ")).toBe("d");
    expect(normalizeVietnamese("Đ")).toBe("d");
  });

  it("should normalize complete Vietnamese words", () => {
    expect(normalizeVietnamese("phở")).toBe("pho");
    expect(normalizeVietnamese("bún")).toBe("bun");
    expect(normalizeVietnamese("bánh")).toBe("banh");
    expect(normalizeVietnamese("thịt")).toBe("thit");
    expect(normalizeVietnamese("cà chua")).toBe("ca chua");
  });

  it("should handle Vietnamese sentences", () => {
    expect(normalizeVietnamese("Món ăn Việt Nam rất ngon")).toBe(
      "mon an viet nam rat ngon",
    );
    expect(normalizeVietnamese("Thịt bò xào cà chua")).toBe(
      "thit bo xao ca chua",
    );
  });

  it("should handle mixed Vietnamese and English text", () => {
    expect(normalizeVietnamese("Vietnamese phở noodles")).toBe(
      "vietnamese pho noodles",
    );
    expect(normalizeVietnamese("Bánh mì sandwich")).toBe("banh mi sandwich");
  });

  it("should handle empty and special characters", () => {
    expect(normalizeVietnamese("")).toBe("");
    expect(normalizeVietnamese(" ")).toBe(" ");
    expect(normalizeVietnamese("123")).toBe("123");
    expect(normalizeVietnamese("!@#$%")).toBe("!@#$%");
  });

  it("should be case insensitive", () => {
    expect(normalizeVietnamese("PHỞ BÒ")).toBe("pho bo");
    expect(normalizeVietnamese("Phở Bò")).toBe("pho bo");
    expect(normalizeVietnamese("phở bò")).toBe("pho bo");
  });

  it("should handle all Vietnamese vowels with diacritics", () => {
    // Testing all 5 Vietnamese tones for each vowel
    const vowelsWithTones = {
      a: ["a", "á", "à", "ả", "ã", "ạ"],
      e: ["e", "é", "è", "ẻ", "ẽ", "ẹ"],
      i: ["i", "í", "ì", "ỉ", "ĩ", "ị"],
      o: ["o", "ó", "ò", "ỏ", "õ", "ọ"],
      u: ["u", "ú", "ù", "ủ", "ũ", "ụ"],
      y: ["y", "ý", "ỳ", "ỷ", "ỹ", "ỵ"],
    };

    Object.entries(vowelsWithTones).forEach(([base, variants]) => {
      variants.forEach((variant) => {
        expect(normalizeVietnamese(variant)).toBe(base);
        expect(normalizeVietnamese(variant.toUpperCase())).toBe(base);
      });
    });
  });

  it("should handle Vietnamese compound vowels", () => {
    expect(normalizeVietnamese("ươ")).toBe("uo");
    expect(normalizeVietnamese("ướ")).toBe("uo");
    expect(normalizeVietnamese("ượ")).toBe("uo");
    expect(normalizeVietnamese("iê")).toBe("ie");
    expect(normalizeVietnamese("iế")).toBe("ie");
    expect(normalizeVietnamese("iệ")).toBe("ie");
  });
});
