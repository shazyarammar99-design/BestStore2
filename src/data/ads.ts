export type AdPlacement = 'navbar' | 'sidebar' | 'footer';

export type DummyAd = {
  id: string;
  ad_image: string;
  ad_link: string;
  alt_text: string;
};

export const DUMMY_ADS: DummyAd[] = [
  {
    id: 'ad-1',
    ad_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
    ad_link: '/category/currency',
    alt_text: 'Double XP Weekend — top up game currency now',
  },
  {
    id: 'ad-2',
    ad_image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&q=80',
    ad_link: '/category/accounts',
    alt_text: 'Premium accounts — instant delivery',
  },
  {
    id: 'ad-3',
    ad_image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80',
    ad_link: '/spin',
    alt_text: 'Spin the wheel daily for free rewards',
  },
];
