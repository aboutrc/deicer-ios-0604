declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY: string;
      EXPO_PUBLIC_OPENAI_API_KEY: string;
    }
  }
}

export {};