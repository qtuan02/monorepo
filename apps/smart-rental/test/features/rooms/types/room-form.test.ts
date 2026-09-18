import { describe, expect, it } from "vitest";

import { roomFormSchema } from "~/features/rooms/types/room-form";

const valid = {
  buildingId: "b1",
  name: "Phòng 101",
  floor: "1",
  area: "20",
  type: "single",
  status: "available",
  price: "2500000",
};

describe("roomFormSchema", () => {
  it("parses the form's strings into the numbers the request wants", () => {
    expect(roomFormSchema.parse(valid)).toEqual({
      buildingId: "b1",
      name: "Phòng 101",
      floor: 1,
      area: 20,
      type: "single",
      status: "available",
      price: 2500000,
    });
  });

  it("trims before checking length, so whitespace is not a name", () => {
    const result = roomFormSchema.safeParse({ ...valid, name: "   " });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Tên phòng phải có ít nhất 1 ký tự",
    );
  });

  it("wants a building chosen", () => {
    expect(roomFormSchema.safeParse({ ...valid, buildingId: "" }).success).toBe(
      false,
    );
  });

  it("wants at least floor 1, as a whole number", () => {
    expect(roomFormSchema.safeParse({ ...valid, floor: "0" }).success).toBe(
      false,
    );
    expect(roomFormSchema.safeParse({ ...valid, floor: "1.5" }).success).toBe(
      false,
    );
  });

  it("wants a price of at least 1đ", () => {
    expect(roomFormSchema.safeParse({ ...valid, price: "0" }).success).toBe(
      false,
    );
  });

  it("rejects a type or status outside the known enum", () => {
    expect(
      roomFormSchema.safeParse({ ...valid, type: "penthouse" }).success,
    ).toBe(false);
    expect(
      roomFormSchema.safeParse({ ...valid, status: "unknown" }).success,
    ).toBe(false);
  });
});
