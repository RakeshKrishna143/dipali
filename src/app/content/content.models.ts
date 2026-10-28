export interface ImageAsset {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface PageHeading {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
}

export interface GallerySection {
  readonly title: string;
  readonly images: readonly ImageAsset[];
}

export interface Service {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly image: ImageAsset;
  readonly paragraphs: readonly string[];
  readonly images: readonly ImageAsset[];
  readonly closing: { readonly title: string; readonly paragraphs: readonly string[] };
}

export interface EventStory {
  readonly slug: string;
  readonly title: string;
  readonly image: ImageAsset;
  readonly venue: string;
  readonly paragraphs: readonly string[];
  readonly galleries: readonly GallerySection[];
}

export interface Review {
  readonly id: string;
  readonly quote: string;
  readonly name: string;
  readonly occasion: string;
  readonly date: string;
}

export interface EditorialSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly image: ImageAsset;
}

export interface Faq {
  readonly question: string;
  readonly answer: readonly string[];
}

export interface VenueGroup {
  readonly region: string;
  readonly venues: readonly {
    readonly name: string;
    readonly city: string;
    readonly preferred: boolean;
  }[];
}

export interface LegalSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export interface SiteContent {
  readonly home: {
    readonly hero: ImageAsset;
    readonly intro: PageHeading;
    readonly services: PageHeading;
    readonly events: PageHeading;
  };
  readonly logo: ImageAsset;
  readonly mark: ImageAsset;
  readonly pages: Readonly<Record<string, PageHeading>>;
  readonly services: readonly Service[];
  readonly events: readonly EventStory[];
  readonly reviews: readonly Review[];
  readonly about: readonly EditorialSection[];
  readonly values: readonly { readonly title: string; readonly description: string }[];
  readonly faqs: readonly Faq[];
  readonly venues: readonly VenueGroup[];
  readonly formOptions: Readonly<
    Record<'eventType' | 'budget' | 'referralSource', readonly string[]>
  >;
}
