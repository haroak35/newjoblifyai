export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  features: string[];
}

export const products: Product[] = [
  {
    id: 'free_plan',
    priceId: '',
    name: 'Free',
    description: 'Perfect for trying out the platform',
    features: [
      'Up to 5 active job postings',
      'Basic AI matching',
      'Email support',
      '25 applicants per job',
      '5 AI shortlist spots'
    ],
  },
  {
    id: 'startup_plan',
    priceId: 'price_1RSffg2K5kHNMsyTaLDeo1UQ',
    name: 'Startup',
    description: 'For growing companies with active hiring needs',
    features: [
      'Up to 40 active job postings',
      'Advanced AI matching',
      'Priority email support',
      '100 applicants per job',
      'Custom AI shortlist spots',
      'Team collaboration'
    ],
  },
  {
    id: 'scaleup_plan',
    priceId: 'price_1Qqc0w2K5kHNMsyT5HQm',
    name: 'Scale Up',
    description: 'For companies scaling their hiring operations',
    features: [
      'Up to 80 active job postings',
      'Premium AI matching',
      '24/7 priority support',
      '200 applicants per job',
      'Custom AI shortlist spots',
      'Advanced analytics',
      'API access'
    ],
  }
];