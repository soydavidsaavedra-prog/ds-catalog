import { storeConfig } from "@/config/store";

class StoreEngine {
  getStore() {
    return storeConfig;
  }

  getName() {
    return storeConfig.name;
  }

  getSlogan() {
    return storeConfig.slogan;
  }

  getWhatsApp() {
    return storeConfig.whatsapp;
  }

  getCurrency() {
    return storeConfig.currency;
  }

  getLocale() {
    return storeConfig.locale;
  }

  getSocial() {
    return storeConfig.social;
  }

  getTheme() {
    return storeConfig.theme;
  }
}

export const storeEngine = new StoreEngine();