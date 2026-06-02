const offsetMinutes = Number(process.env.CLOCK_OFFSET_MINUTES || 0);

if (offsetMinutes) {
  const RealDate = Date;
  const offsetMs = offsetMinutes * 60 * 1000;

  global.Date = class extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [RealDate.now() + offsetMs]));
    }

    static now() {
      return RealDate.now() + offsetMs;
    }

    static parse = RealDate.parse;
    static UTC = RealDate.UTC;
  };
}

require('./index');
