import { describe, it, expect } from "vitest";
import {
  normalizeVietnamese,
  createVietnameseSearchConditions,
} from "../vietnamese";

describe("Vietnamese Utils", () => {
  describe("normalizeVietnamese", () => {
    it("should remove Vietnamese diacritics correctly", () => {
      expect(normalizeVietnamese("phở")).toBe("pho");
      expect(normalizeVietnamese("bánh mì")).toBe("banh mi");
      expect(normalizeVietnamese("bún bò huế")).toBe("bun bo hue");
      expect(normalizeVietnamese("thịt nướng")).toBe("thit nuong");
    });

    it("should handle uppercase Vietnamese text", () => {
      expect(normalizeVietnamese("PHỞ BÒ")).toBe("pho bo");
      expect(normalizeVietnamese("BÁNH MÌ")).toBe("banh mi");
      expect(normalizeVietnamese("NƯỚC MẮM")).toBe("nuoc mam");
    });

    it("should handle mixed case Vietnamese text", () => {
      expect(normalizeVietnamese("Phở Bò Tái")).toBe("pho bo tai");
      expect(normalizeVietnamese("Bánh Mì Thịt")).toBe("banh mi thit");
    });

    it("should handle đ and Đ characters", () => {
      expect(normalizeVietnamese("đậu phộng")).toBe("dau phong");
      expect(normalizeVietnamese("Đà Nẵng")).toBe("da nang");
      expect(normalizeVietnamese("đường")).toBe("duong");
    });

    it("should handle empty and whitespace", () => {
      expect(normalizeVietnamese("")).toBe("");
      expect(normalizeVietnamese(" ")).toBe(" ");
      expect(normalizeVietnamese("  ")).toBe("  ");
    });

    it("should preserve numbers and special characters", () => {
      expect(normalizeVietnamese("phở 24/7")).toBe("pho 24/7");
      expect(normalizeVietnamese("giá 50,000đ")).toBe("gia 50,000d");
    });

    it("should handle complex Vietnamese dishes", () => {
      expect(normalizeVietnamese("Cơm tấm sườn nướng")).toBe(
        "com tam suon nuong",
      );
      expect(normalizeVietnamese("Gỏi cuốn tôm thịt")).toBe(
        "goi cuon tom thit",
      );
      expect(normalizeVietnamese("Chả cá Lã Vọng")).toBe("cha ca la vong");
    });

    it("should be consistent with repeated calls", () => {
      const text = "Món ăn Việt Nam";
      const normalized = normalizeVietnamese(text);
      expect(normalizeVietnamese(normalized)).toBe(normalized);
    });
  });

  describe("createVietnameseSearchConditions", () => {
    it("should create conditions for single field", () => {
      const conditions = createVietnameseSearchConditions("phở", ["name_vi"]);

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({
        name_vi: {
          contains: "pho",
          mode: "insensitive",
        },
      });
      expect(conditions[1]).toEqual({
        name_vi: {
          contains: "phở",
          mode: "insensitive",
        },
      });
    });

    it("should create conditions for multiple fields", () => {
      const conditions = createVietnameseSearchConditions("bánh mì", [
        "name_vi",
        "description_vi",
      ]);

      expect(conditions).toHaveLength(4);

      // Normalized search for first field
      expect(conditions[0]).toEqual({
        name_vi: {
          contains: "banh mi",
          mode: "insensitive",
        },
      });

      // Original search for first field
      expect(conditions[1]).toEqual({
        name_vi: {
          contains: "bánh mì",
          mode: "insensitive",
        },
      });

      // Normalized search for second field
      expect(conditions[2]).toEqual({
        description_vi: {
          contains: "banh mi",
          mode: "insensitive",
        },
      });

      // Original search for second field
      expect(conditions[3]).toEqual({
        description_vi: {
          contains: "bánh mì",
          mode: "insensitive",
        },
      });
    });

    it("should handle queries that dont need normalization", () => {
      const conditions = createVietnameseSearchConditions("chicken", [
        "name_en",
      ]);

      // Should only create one condition since normalized and original are the same
      expect(conditions).toHaveLength(1);
      expect(conditions[0]).toEqual({
        name_en: {
          contains: "chicken",
          mode: "insensitive",
        },
      });
    });

    it("should handle empty query", () => {
      const conditions = createVietnameseSearchConditions("", ["name_vi"]);
      expect(conditions).toHaveLength(0);
    });

    it("should handle whitespace-only query", () => {
      const conditions = createVietnameseSearchConditions("   ", ["name_vi"]);
      expect(conditions).toHaveLength(0);
    });

    it("should trim whitespace from query", () => {
      const conditions = createVietnameseSearchConditions("  phở  ", [
        "name_vi",
      ]);

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({
        name_vi: {
          contains: "pho",
          mode: "insensitive",
        },
      });
      expect(conditions[1]).toEqual({
        name_vi: {
          contains: "phở",
          mode: "insensitive",
        },
      });
    });

    it("should handle mixed Vietnamese and English queries", () => {
      const conditions = createVietnameseSearchConditions("Vietnamese phở", [
        "name_vi",
        "name_en",
      ]);

      expect(conditions).toHaveLength(4);
      expect(conditions[0]).toEqual({
        name_vi: {
          contains: "vietnamese pho",
          mode: "insensitive",
        },
      });
    });

    it("should handle complex Vietnamese phrases", () => {
      const conditions = createVietnameseSearchConditions(
        "thịt bò xào cà chua",
        ["description_vi"],
      );

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({
        description_vi: {
          contains: "thit bo xao ca chua",
          mode: "insensitive",
        },
      });
      expect(conditions[1]).toEqual({
        description_vi: {
          contains: "thịt bò xào cà chua",
          mode: "insensitive",
        },
      });
    });

    it("should handle uppercase Vietnamese queries", () => {
      const conditions = createVietnameseSearchConditions("PHỞ BÒ", [
        "name_vi",
      ]);

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({
        name_vi: {
          contains: "pho bo",
          mode: "insensitive",
        },
      });
      expect(conditions[1]).toEqual({
        name_vi: {
          contains: "PHỞ BÒ",
          mode: "insensitive",
        },
      });
    });

    it("should handle queries with numbers and special characters", () => {
      const conditions = createVietnameseSearchConditions("phở 24/7", [
        "name_vi",
      ]);

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({
        name_vi: {
          contains: "pho 24/7",
          mode: "insensitive",
        },
      });
      expect(conditions[1]).toEqual({
        name_vi: {
          contains: "phở 24/7",
          mode: "insensitive",
        },
      });
    });

    it("should work with real-world Vietnamese ingredient names", () => {
      const testCases = [
        "bột ngọt",
        "đường thốt nốt",
        "nước mắm",
        "tương ớt",
        "rau răm",
      ];

      testCases.forEach((query) => {
        const conditions = createVietnameseSearchConditions(query, ["name_vi"]);
        expect(conditions.length).toBeGreaterThan(0);
        expect(conditions[0].name_vi.contains).toBe(normalizeVietnamese(query));
      });
    });
  });
});
