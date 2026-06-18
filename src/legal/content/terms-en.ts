import type { LegalDocument } from '@/legal/types';
import { LEGAL_CONTACT, LEGAL_ENTITY, SITE_NAME } from '@/legal/config';

export const TERMS_EN: LegalDocument = {
  title: 'Terms of Service',
  subtitle: `Please read these terms carefully before using ${SITE_NAME}.`,
  sections: [
    {
      id: 'introduction',
      title: '1. Introduction and Acceptance',
      paragraphs: [
        `These Terms of Service ("Terms") govern your access to and use of the ${SITE_NAME} website, accounts, and related services (collectively, the "Service") operated by ${LEGAL_ENTITY} ("we," "us," or "our").`,
        'By accessing or using the Service, creating an account, or completing a purchase, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.',
      ],
    },
    {
      id: 'brand-disclaimer',
      title: '2. Brand Name Disclaimer',
      paragraphs: [
        `The names "${SITE_NAME}," "BEST," and any related logos, slogans, or branding are trade names and trademarks used for identification purposes only.`,
        'They do not represent a claim that our products, services, or business are objectively "the best," superior to any competitor, highest-rated, or endorsed by any third party.',
        'We are not affiliated with, sponsored by, or endorsed by PUBG Corporation, Krafton, Valve Corporation, Steam, Epic Games, Riot Games, Activision, Microsoft, Sony, Nintendo, or any other game publisher or platform unless we expressly state otherwise in writing.',
      ],
    },
    {
      id: 'eligibility',
      title: '3. Eligibility',
      paragraphs: [
        'You must be at least 18 years old, or the age of legal majority in your jurisdiction (including the Republic of Iraq and the Kurdistan Region of Iraq), to use the Service.',
        'You may maintain only one account unless we authorize otherwise. You are responsible for ensuring your use of the Service is lawful where you live.',
      ],
    },
    {
      id: 'products',
      title: '4. Products and Digital Delivery',
      paragraphs: [
        'We sell digital products and services only, including but not limited to game accounts, in-game currency, software tools, bypass utilities, bundles, and related digital access.',
        'No physical goods are shipped. Delivery is electronic and typically occurs after payment confirmation, which may require manual verification through WhatsApp, Discord, or other supported channels.',
        'Product descriptions, images, and status indicators (including "undetected" or similar labels) are provided for informational purposes and may change without notice as games and platforms update.',
      ],
    },
    {
      id: 'user-responsibility',
      title: '5. User Responsibility and Third-Party Terms',
      paragraphs: [
        'You understand that many products we offer may conflict with the terms of service, end-user license agreements, or anti-cheat policies of game publishers and platforms.',
        'You assume full responsibility and all risk for any consequences of using our products, including account suspensions, permanent bans, hardware bans, loss of in-game progress, loss of purchased game content, or other penalties imposed by third parties.',
        'We do not guarantee that any product will remain undetected, functional, or available for any specific period. Game updates, anti-cheat changes, and platform policy changes can affect products at any time.',
      ],
    },
    {
      id: 'payments',
      title: '6. Payments',
      paragraphs: [
        'Prices may be displayed in Iraqi Dinar (IQD) or other currencies. You agree to pay the full amount for your order using an available payment method, which may include bank cards (via Stripe), cryptocurrency, FIB, FastPay, WhatsApp-confirmed transfers, or other methods we offer.',
        'Orders may remain pending until we confirm payment. You are responsible for providing accurate payment references and order details when requested.',
        'Card payments processed through Stripe are also subject to Stripe\'s terms and privacy policy. We do not store full payment card numbers on our servers.',
      ],
    },
    {
      id: 'refunds',
      title: '7. Refunds and Chargebacks',
      paragraphs: [
        'If a product does not work as described and our support team cannot resolve the issue after you cooperate in good faith, we may offer a full refund or replacement at our discretion.',
        'Refund requests must be submitted promptly through our support channels with relevant order details. Abuse of refund requests, fraudulent claims, or unjustified payment chargebacks may result in immediate account termination and denial of future service.',
      ],
    },
    {
      id: 'promotions',
      title: '8. Spin Wheel and Promotions',
      paragraphs: [
        'Promotional features such as the spin wheel, leaderboard points, monthly free spins, and purchase-based credits are offered at our sole discretion.',
        'Prize odds and outcomes are determined server-side. We may modify, suspend, or discontinue any promotion, prize, or credit rule at any time.',
        'Promotional credits and prizes have no cash value unless we expressly state otherwise and may not be transferred or resold.',
      ],
    },
    {
      id: 'leaderboard',
      title: '9. Leaderboard and Community',
      paragraphs: [
        'If you participate in leaderboard or community features, your username and related activity may be displayed publicly.',
        'You agree not to impersonate others, manipulate rankings through fraud, or use offensive usernames or content.',
      ],
    },
    {
      id: 'prohibited',
      title: '10. Prohibited Conduct',
      bullets: [
        'Using the Service for fraud, money laundering, or unauthorized reselling of products.',
        'Attempting to hack, scrape, overload, reverse engineer, or disrupt the Service.',
        'Sharing, sublicensing, or redistributing products in violation of product-specific rules or these Terms.',
        'Providing false identity or payment information.',
        'Harassing our staff or other users on WhatsApp, Discord, or other channels.',
      ],
      paragraphs: [
        'You agree not to engage in the following:',
      ],
    },
    {
      id: 'suspension',
      title: '11. Account Suspension',
      paragraphs: [
        'We may suspend or terminate your account, cancel orders, or refuse service if we reasonably believe you violated these Terms, applicable law, or payment provider rules.',
        'You may stop using the Service at any time. Sections that by their nature should survive termination will survive, including disclaimers, limitations of liability, and indemnification.',
      ],
    },
    {
      id: 'warranties',
      title: '12. Disclaimer of Warranties',
      paragraphs: [
        'THE SERVICE AND ALL PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY.',
        'WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTY ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.',
      ],
    },
    {
      id: 'liability',
      title: '13. Limitation of Liability',
      paragraphs: [
        'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE OR A PRODUCT SHALL NOT EXCEED THE AMOUNT YOU PAID US FOR THE SPECIFIC ORDER GIVING RISE TO THE CLAIM DURING THE TWELVE (12) MONTHS BEFORE THE CLAIM.',
        'WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, ACCOUNT BANS, OR LOSS OF GAME ACCESS, EVEN IF WE WERE ADVISED OF THE POSSIBILITY.',
      ],
    },
    {
      id: 'indemnification',
      title: '14. Indemnification',
      paragraphs: [
        `You agree to defend, indemnify, and hold harmless ${LEGAL_ENTITY}, its operators, and affiliates from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, your violation of third-party rights, or your misuse of any product purchased through the Service.`,
      ],
    },
    {
      id: 'governing-law',
      title: '15. Governing Law and Disputes',
      paragraphs: [
        'These Terms are governed by the laws of the Republic of Iraq, without regard to conflict-of-law principles.',
        'If you are located in the Kurdistan Region of Iraq, you retain any rights and protections available to you under applicable local laws in addition to these Terms.',
        'Parties agree to attempt good-faith resolution through our support channels before pursuing formal legal action. Unresolved disputes shall be submitted to the competent courts of Iraq or the Kurdistan Region of Iraq, as appropriate to your location and the nature of the dispute.',
      ],
    },
    {
      id: 'changes',
      title: '16. Changes to These Terms',
      paragraphs: [
        'We may update these Terms from time to time. The "Last updated" date at the top of this page indicates when changes were last made.',
        'Continued use of the Service after changes become effective constitutes acceptance of the revised Terms.',
      ],
    },
    {
      id: 'contact',
      title: '17. Contact',
      paragraphs: [
        `For questions about these Terms, contact ${LEGAL_ENTITY}:`,
        `WhatsApp: ${LEGAL_CONTACT.whatsapp}`,
        `Discord: ${LEGAL_CONTACT.discordUrl}`,
        `Email: ${LEGAL_CONTACT.email}`,
      ],
    },
  ],
};
