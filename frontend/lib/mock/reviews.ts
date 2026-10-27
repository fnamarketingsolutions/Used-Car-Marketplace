export type MockReview = {
  id: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
};

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "1",
    name: "Ananya Sharma",
    city: "Pune",
    rating: 5,
    quote:
      "Listed my Honda City in the morning and had serious buyers by evening. The process felt clear and trustworthy.",
  },
  {
    id: "2",
    name: "Rahul Mehta",
    city: "Ahmedabad",
    rating: 5,
    quote:
      "Found a well-maintained Creta without endless broker calls. Photos, specs, and seller chat were all in one place.",
  },
  {
    id: "3",
    name: "Sneha Iyer",
    city: "Bengaluru",
    rating: 4,
    quote:
      "Selling was straightforward. Dashboard made it easy to pause the listing and track inquiries.",
  },
];
