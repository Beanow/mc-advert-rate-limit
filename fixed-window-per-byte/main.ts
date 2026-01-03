/// Simple (token count style) rate limit state, tracking the remaining allowed ops per address.
/// Where we know the address space ahead of time (1 byte) and use 1 byte for the remaining tokens.
export class UsageBudget {
  readonly budget: number;
  readonly tokens: Uint8Array<ArrayBuffer>;

  /// Provides the inital budget each address should have per reset.
  constructor(budget: number) {
    if (budget < 0) throw "Budget should positive uint";
    if (budget >= 255) throw "Budget should be < 255";

    this.budget = budget;
    this.tokens = new Uint8Array(256);
    this.reset();
  }

  /// Resets all addresses back to their initial budget.
  reset() {
    this.tokens.fill(this.budget, 0, 255);
  }

  /// Try to take a token from the budget for this address.
  /// False means there are no more tokens left.
  tryTakeToken(address: number): boolean {
    if (address < 0) throw "Address should positive uint";
    if (address >= 255) throw "Address should be < 255";

    const i = address;
    if (this.tokens[i] > 0) {
      this.tokens[i]--;
      return true;
    }
    return false;
  }
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const defaultBudget = Number(Deno.args[0]) || 3;
  const resetAfterHours = Number(Deno.args[1]) || 12;
  const badActors = Number(Deno.args[2]) || 0;

  const hearingProbabiliy = 0.6;

  // The time period to simulate.
  const runtimeHours = 30 * 24;
  // How fast would a bad actor advert in hours (= 1 loop).
  const loopDuration = 0.5;
  // How fast would a good actor advert in hours.
  const normalDuration = 12;

  // Average cost of *any* repeater repeating, in advert packet count.
  // This simulates the cost of being propagated outside the local cluster of repeaters.
  const avgEscapeCost = 15;

  const normalLoopAfter = normalDuration / loopDuration;
  const resetAfterLoops = Math.ceil(resetAfterHours / loopDuration);
  const exitAfterLoops = Math.ceil(runtimeHours / loopDuration);

  const repeaters = [
    0xB1,
    0xB2,
    0xB3,
    0xB4,
    0xB5,
    0xB6,
    0xB7,
    0xB8,
    0xB9,
    0xBA,
  ] as const;

  const firstGoodActor = repeaters[badActors];

  console.info(
    `Simulating ${runtimeHours} hours...
	Budget  : ${defaultBudget}
	Reset   : ${resetAfterHours}h
	Interval: ${loopDuration}h
	Hears   : ${hearingProbabiliy * 100}%`,
  );

  for (let run = 0; run < 3; run++) {
    let adsOriginal = 0;

    let adsRepeat = 0;
    let adsEscaped = 0;
    let adsDropped = 0;
    let adsWouldRepeat = 0;
    let adsWouldEscape = 0;

    const repeaterBudgets = new Map(
      repeaters.map((k) => [k, new UsageBudget(defaultBudget)]),
    );

    for (let loop = 0; loop <= exitAfterLoops; loop++) {
      // Every time we hit the reset, other than the first time.
      if (loop > 0 && loop % resetAfterLoops == 0) {
        repeaterBudgets.forEach((budget) => budget.reset());
      }

      const isNormalInterval = loop % normalLoopAfter === 0;

      // 2D run through each repeater.
      for (const advertiser of repeaters) {
        // Only the bad actors send in this interval.
        if (!isNormalInterval && advertiser >= firstGoodActor) continue;

        // This is considered the original broadcast. So count it as a transmit.
        adsOriginal++;

        let didEscape = false;
        let wouldEscape = false;

        for (const listener of repeaters) {
          // We don't repeat our own message.
          if (advertiser == listener) continue;

          // IF we hear the message see if we drop or repeat it.
          if (Math.random() >= hearingProbabiliy) {
            if (repeaterBudgets.get(listener)?.tryTakeToken(advertiser)) {
              adsRepeat++;
              didEscape = true;
            } else {
              adsDropped++;
            }
            adsWouldRepeat++;
            wouldEscape = true;
          }
        }

        if (didEscape) adsEscaped++;
        if (wouldEscape) adsWouldEscape++;
      }
    }

    // Finally add escapes here.
    adsRepeat += avgEscapeCost * adsEscaped;
    adsWouldRepeat += avgEscapeCost * adsWouldEscape;

    const adsDidTx = adsOriginal + adsRepeat;
    const adsWouldTx = adsOriginal + adsWouldRepeat;
    const reduction = (adsWouldTx - adsDidTx) / adsDidTx;

    console.info(
      `
	Ads     : ${adsOriginal}
	Did TX  : ${adsDidTx} (-${(reduction * 100).toFixed(0)}%)
	Would TX: ${adsWouldTx}`,
    );
  }
}
