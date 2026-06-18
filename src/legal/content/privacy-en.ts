import type { LegalDocument } from '@/legal/types';
import { LEGAL_CONTACT, LEGAL_ENTITY, SITE_NAME } from '@/legal/config';

export const PRIVACY_EN: LegalDocument = {
  title: 'Privacy Policy',
  subtitle: `How ${SITE_NAME} collects, uses, and protects your information.`,
  sections: [
    {
      id: 'who-we-are',
      title: '1. Who We Are',
      paragraphs: [
        `This Privacy Policy describes how ${LEGAL_ENTITY} ("${SITE_NAME}," "we," "us") handles personal information when you use our website and services.`,
        'The name "BEST" and "BEST STORE" are brand identifiers only and do not imply any particular ranking or third-party endorsement. See our Terms of Service for the full brand disclaimer.',
      ],
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      paragraphs: ['We may collect the following categories of information:'],
      bullets: [
        'Account data: email address, password (stored in hashed form by our authentication provider), username, and profile avatar.',
        'Order data: cart contents, purchase history, selected payment method, order amounts, and product details.',
        'Usage data: spin wheel activity, prize inventory, leaderboard points, locale and currency preferences.',
        'Technical data: cookies, browser local storage (including an anonymous session ID used for our "users online" counter), device/browser type, and server logs collected by our hosting provider.',
        'Communications: messages you send us on WhatsApp, Discord, or email (those platforms have their own privacy policies).',
      ],
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Information',
      bullets: [
        'Create and manage your account.',
        'Process orders and deliver digital products.',
        'Provide customer support and resolve disputes.',
        'Operate promotions such as the spin wheel and leaderboard.',
        'Display anonymized or masked purchase notifications to other visitors.',
        'Prevent fraud, abuse, and unauthorized access.',
        'Improve and secure the Service.',
      ],
      paragraphs: ['We use personal information to:'],
    },
    {
      id: 'legal-bases',
      title: '4. Legal Bases for Processing',
      paragraphs: [
        'We process information as necessary to perform our contract with you (fulfilling orders and accounts), based on our legitimate interests (security, analytics, service improvement), and where required, your consent (such as optional marketing or non-essential cookies where applicable).',
      ],
    },
    {
      id: 'third-parties',
      title: '5. Third-Party Service Providers',
      paragraphs: [
        'We use trusted processors to operate the Service, including:',
      ],
      bullets: [
        'Supabase — authentication, database, and file storage.',
        'Stripe — card payment processing (when enabled).',
        'Google AdSense — advertising (only when enabled in our configuration).',
        'Vercel — website hosting and content delivery.',
        'Discord API — server-side retrieval of public vouch channel message counts (we do not receive your Discord login through our website).',
      ],
    },
    {
      id: 'cookies',
      title: '6. Cookies and Local Storage',
      paragraphs: [
        'We use cookies and similar technologies for essential functions, including authentication sessions, language preference (`best-locale`), currency preference (`best-currency`), and an anonymous presence session ID for counting active visitors.',
        'If advertising is enabled, third-party ad partners may set additional cookies subject to their own policies.',
        'You can control cookies through your browser settings. Disabling essential cookies may limit account login and checkout functionality.',
      ],
    },
    {
      id: 'retention',
      title: '7. Data Retention',
      paragraphs: [
        'We retain account and purchase records while your account is active and as needed for accounting, fraud prevention, and legal obligations.',
        'Anonymous presence records are deleted automatically after a short inactivity period.',
        'You may request account deletion by contacting support; some records may be retained where required by law or for dispute resolution.',
      ],
    },
    {
      id: 'sharing',
      title: '8. How We Share Information',
      paragraphs: [
        'We do not sell your personal information.',
        'We share information with service providers who process data on our behalf, when required by law, to protect our rights, or in connection with a business transfer. Service providers are required to use data only as instructed.',
      ],
    },
    {
      id: 'security',
      title: '9. Security',
      paragraphs: [
        'We implement reasonable technical and organizational measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      id: 'your-rights',
      title: '10. Your Rights',
      paragraphs: [
        'Depending on your location, including the Republic of Iraq and the Kurdistan Region of Iraq, you may have rights to access, correct, delete, or restrict certain processing of your personal information.',
        'You can update profile information through your account page where available, or contact us to exercise your rights.',
      ],
    },
    {
      id: 'children',
      title: '11. Children',
      paragraphs: [
        'The Service is not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us data, contact us and we will delete it.',
      ],
    },
    {
      id: 'international',
      title: '12. International Data Transfers',
      paragraphs: [
        'Your information may be processed in countries other than where you live, including regions where our hosting and database providers operate (such as the United States or European Union). We take steps to ensure appropriate safeguards where required.',
      ],
    },
    {
      id: 'changes-contact',
      title: '13. Changes and Contact',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The "Last updated" date shows when changes were made.',
        `For privacy questions or requests, contact ${LEGAL_ENTITY}:`,
        `Discord: ${LEGAL_CONTACT.discordUrl}`,
        ...(LEGAL_CONTACT.email ? [`Email: ${LEGAL_CONTACT.email}`] : []),
      ],
    },
  ],
};
