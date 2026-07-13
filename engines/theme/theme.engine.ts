import { storeConfig } from "@/config/store";

class ThemeEngine {
  getTheme() {
    return storeConfig.theme;
  }

  getPrimaryColor() {
    return storeConfig.theme.primary;
  }

  getSecondaryColor() {
    return storeConfig.theme.secondary;
  }

  getStoreName() {
    return storeConfig.name;
  }

  getCurrency() {
    return storeConfig.currency;
  }

  getWhatsApp() {
    return storeConfig.whatsapp;
  }
}

export const themeEngine = new ThemeEngine();