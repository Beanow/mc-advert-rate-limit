import { assertEquals } from "@std/assert";
import { UsageBudget } from "./main.ts";

Deno.test(function budgetCanTakeAndReset() {
  const budget = new UsageBudget(3);

  assertEquals([
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
  ], [true, true, true, false, false]);

  budget.reset();

  assertEquals([
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
    budget.tryTakeToken(0xAB),
  ], [true, true, true, false, false]);
});
