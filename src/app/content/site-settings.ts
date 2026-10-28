export const siteSettings = {
  name: 'House of Dipali',
  phone: '917-753-3745',
  phoneHref: 'tel:9177533745',
  email: 'info@dipali.com',
  address: '216 E 2nd St, Mineola, NY 11501',
  mapUrl: 'https://maps.app.goo.gl/wTnosgmxDT86dh8x6',
  description:
    'Luxury wedding & event decor, floral design, and full-weekend styling across New York, New Jersey & Connecticut.',
  navigation: [
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'FAQs', path: '/faqs' },
  ],
  trustedVenues: [
    'Casa Cipriani',
    'Oheka Castle',
    'Spring Field Country Club',
    'The Legacy Castle',
    'The Palace at Somerset',
    'The Venetian',
  ],
  socials: [
    { label: 'Facebook', url: 'https://www.facebook.com/houseofdipali/' },
    { label: 'Instagram', url: 'https://www.instagram.com/houseofdipali/' },
    { label: 'Pinterest', url: 'https://www.pinterest.com/houseofdipali/' },
    { label: 'YouTube', url: 'https://www.youtube.com/channel/UCFOuhvbAlEU1X2mN0FNpseQ/featured' },
    { label: 'X', url: 'https://twitter.com/houseofdipali1' },
  ],
} as const;
