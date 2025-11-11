export const YOOKASSA_CONFIG = {
  shopId: process.env.YOOKASSA_SHOP_ID, // Получите в личном кабинете ЮKassa
  secretKey: process.env.YOOKASSA_SECRET_KEY, // Секретный ключ
  returnUrl: process.env.APP_URL + '/payment/success',
  webhookUrl: process.env.API_URL + '/webhooks/yookassa',
};
