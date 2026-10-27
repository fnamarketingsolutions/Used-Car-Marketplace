export type MockCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  transmission: string;
  city: string;
  state: string;
  image: string;
  condition: string;
};

export const MOCK_CARS: MockCar[] = [
  {
    id: "1",
    make: "Honda",
    model: "City",
    year: 2021,
    price: 945000,
    km: 28400,
    fuel: "Petrol",
    transmission: "Automatic",
    city: "Pune",
    state: "Maharashtra",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80",
    condition: "Excellent",
  },
  {
    id: "2",
    make: "Maruti",
    model: "Swift",
    year: 2020,
    price: 585000,
    km: 41200,
    fuel: "Petrol",
    transmission: "Manual",
    city: "Jaipur",
    state: "Rajasthan",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
    condition: "Good",
  },
  {
    id: "3",
    make: "Hyundai",
    model: "Creta",
    year: 2022,
    price: 1325000,
    km: 19800,
    fuel: "Diesel",
    transmission: "Automatic",
    city: "Bengaluru",
    state: "Karnataka",
    image:
      "https://images.unsplash.com/photo-1511919884225-9123c6594d8f?auto=format&fit=crop&w=1200&q=80",
    condition: "Excellent",
  },
  {
    id: "4",
    make: "Toyota",
    model: "Innova Crysta",
    year: 2019,
    price: 1580000,
    km: 54000,
    fuel: "Diesel",
    transmission: "Manual",
    city: "Hyderabad",
    state: "Telangana",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
    condition: "Good",
  },
  {
    id: "5",
    make: "Tata",
    model: "Nexon",
    year: 2023,
    price: 1120000,
    km: 12600,
    fuel: "Electric",
    transmission: "Automatic",
    city: "Ahmedabad",
    state: "Gujarat",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    condition: "Excellent",
  },
  {
    id: "6",
    make: "Mahindra",
    model: "XUV700",
    year: 2022,
    price: 1890000,
    km: 22100,
    fuel: "Petrol",
    transmission: "Automatic",
    city: "Chennai",
    state: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    condition: "Excellent",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatKm(km: number) {
  return `${new Intl.NumberFormat("en-IN").format(km)} km`;
}
