export type SettingsMenuKey =
  | 'settingsAccount'
  | 'settingsSocial'
  | 'settingsPrivacy'
  | 'settingsVerification';

export type SellingMenuKey =
  | 'sellingCreateOffer'
  | 'sellingManageOffer'
  | 'sellingSoldOrders'
  | 'sellingPayment'
  | 'sellingApiIntegration';

export type AccountMenuKey = SettingsMenuKey | SellingMenuKey;

export const SELLING_LINKS: { href: string; key: SellingMenuKey }[] = [
  { href: '/account/selling/create-offer', key: 'sellingCreateOffer' },
  { href: '/account/selling/manage-offer', key: 'sellingManageOffer' },
  { href: '/account/selling/sold-orders', key: 'sellingSoldOrders' },
  { href: '/account/selling/payment', key: 'sellingPayment' },
  { href: '/account/selling/api-integration', key: 'sellingApiIntegration' },
];

export const SETTINGS_LINKS: { href: string; key: SettingsMenuKey }[] = [
  { href: '/account/settings/account', key: 'settingsAccount' },
  { href: '/account/settings/social', key: 'settingsSocial' },
  { href: '/account/settings/privacy', key: 'settingsPrivacy' },
  { href: '/account/settings/verification', key: 'settingsVerification' },
];

export type OrderTabId =
  | 'to-pay'
  | 'verify'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'cancelled'
  | 'resolution';

export const ORDER_TABS: { id: OrderTabId; labelKey: string }[] = [
  { id: 'to-pay', labelKey: 'ordersTabToPay' },
  { id: 'verify', labelKey: 'ordersTabVerify' },
  { id: 'preparing', labelKey: 'ordersTabPreparing' },
  { id: 'delivering', labelKey: 'ordersTabDelivering' },
  { id: 'completed', labelKey: 'ordersTabCompleted' },
  { id: 'cancelled', labelKey: 'ordersTabCancelled' },
  { id: 'resolution', labelKey: 'ordersTabResolution' },
];
