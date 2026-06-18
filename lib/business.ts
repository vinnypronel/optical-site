export const BUSINESS = {
  name: 'Avenue Eyewear',
  phone: '(732) 583-2800',
  phoneHref: 'tel:+17325832800',
  email: 'hello@avenueeyewear.com',
  street: '351 Matawan Rd B',
  city: 'Matawan',
  region: 'NJ',
  postal: '07747',
  geo: { lat: 40.4305742, lng: -74.2513685 },
  url: 'https://www.avenueeyewear.com',
  mapUrl:
    'https://www.google.com/maps/place/Avenue+Eyewear/@40.4305742,-74.2539434,17z',
  established: 2020,
} as const;

export const HOURS = [
  { day: 'Mon', time: 'Closed' },
  { day: 'Tue', time: '11:00 – 6:00' },
  { day: 'Wed', time: '11:00 – 5:00' },
  { day: 'Thu', time: 'Closed' },
  { day: 'Fri', time: '10:00 – 3:00' },
  { day: 'Sat', time: 'Closed' },
  { day: 'Sun', time: 'Closed' },
] as const;

// schema.org openingHours spec format
export const SCHEMA_HOURS = [
  'Tu 11:00-18:00',
  'We 11:00-17:00',
  'Fr 10:00-15:00',
];
