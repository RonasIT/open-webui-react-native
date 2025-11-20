const defaultOptionName = 'default';

class AppEnv {
  get current() {
    return this.env;
  }

  constructor(env) {
    this.env = env;

    if (!this.env) {
      throw new Error(
        'Got empty current environment name! Please make sure you have set NEXT_PUBLIC_APP_ENV (Next.js) or EXPO_PUBLIC_APP_ENV (RN) env variable.',
      );
    }
  }

  select(options) {
    const envKeys = Object.keys(options);
    const shouldUseDefault = !envKeys.includes(this.current);

    if (shouldUseDefault && !envKeys.includes(defaultOptionName)) {
      throw new Error(`Missing value for environment '${this.current}' and '${defaultOptionName}' option was not set.`);
    }

    return shouldUseDefault ? options[defaultOptionName] : options[this.current];
  }
}

module.exports = { AppEnv };
