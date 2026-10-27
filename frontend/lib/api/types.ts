export type UserRole = "user" | "admin";

export type AccountStatus = "active" | "suspended" | "blocked";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  warnings?: number | unknown[];
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  blockedAt?: string | null;
  blockedReason?: string | null;
  notificationSettings?: Record<string, unknown>;
  privacySettings?: Record<string, unknown>;
  googleConnected?: boolean;
  googleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  accessToken: string;
  redirectTo: string;
  user: AuthUser;
};

export type DashboardBuy = {
  savedCarsCount: number;
  savedSearchesCount: number;
  contactedSellersCount: number;
  inquiriesCount: number;
  alertsCount: number;
  recentInquiries: unknown[];
};

export type DashboardSell = {
  total: number;
  active: number;
  paused: number;
  sold: number;
  draft: number;
  totalViews: number;
  recentBuyerInquiries: unknown[];
};

export type DashboardResponse = {
  message: string;
  user: AuthUser;
  buy: DashboardBuy;
  sell: DashboardSell;
};

export type ListingStatus =
  | "Draft"
  | "Live"
  | "Paused"
  | "Sold"
  | "Expired"
  | "Removed";

export type ListingPhoto = {
  url: string;
  publicId: string;
};

export type ListingPhotos = {
  front?: ListingPhoto;
  rear?: ListingPhoto;
  leftSide?: ListingPhoto;
  rightSide?: ListingPhoto;
  interior?: ListingPhoto;
  dashboard?: ListingPhoto;
  odometer?: ListingPhoto;
  engine?: ListingPhoto;
  other?: ListingPhoto[];
};

export type ListingCity = {
  _id?: string;
  name?: string;
  state?: string;
  slug?: string;
} | null;

export type MyListing = {
  _id: string;
  make?: string;
  model?: string;
  variant?: string;
  manufacturingYear: number;
  registrationYear?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  kilometresDriven?: number;
  numberOfOwners?: number;
  colour?: string;
  askingPrice?: number;
  negotiable?: boolean;
  overallCondition?: string;
  accidentHistory?: string;
  insuranceStatus?: string;
  serviceHistory?: string;
  rcAvailability?: string;
  loanHypothecationStatus?: string;
  additionalInformation?: string;
  state?: string;
  status: ListingStatus;
  viewCount?: number;
  slug?: string;
  photos?: ListingPhotos;
  city?: ListingCity;
  seller?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type MyListingsResponse = {
  listings: MyListing[];
};

export type ListingByIdResponse = {
  listing: MyListing;
};

export type ListingMutationResponse = {
  message: string;
  listing: MyListing;
};

/** Public browse listing (full serializer fields; cards show a subset). */
export type PublicListing = {
  _id?: string | null;
  make?: string | null;
  model?: string | null;
  variant?: string | null;
  manufacturingYear?: number;
  registrationYear?: number;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  kilometresDriven?: number;
  numberOfOwners?: number | null;
  colour?: string | null;
  askingPrice?: number | null;
  negotiable?: boolean;
  overallCondition?: string | null;
  accidentHistory?: string | null;
  insuranceStatus?: string | null;
  serviceHistory?: string | null;
  rcAvailability?: string | null;
  loanHypothecationStatus?: string | null;
  additionalInformation?: string | null;
  state?: string | null;
  city?: { name?: string; state?: string; slug?: string } | null;
  photos?: Record<string, { url?: string } | { url?: string }[] | undefined>;
  slug?: string | null;
  path?: string | null;
  viewCount?: number;
  stars?: number | null;
  primaryImage?: string | null;
  seller?: {
    _id?: string | null;
    fullName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    phoneVisible?: boolean;
    stars?: number | null;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type PublicListingsResponse = {
  listings: PublicListing[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LocationState = {
  _id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
};

export type LocationCity = {
  _id: string;
  name: string;
  state?: string;
  stateId?: string | { _id?: string; name?: string; slug?: string };
  slug?: string;
  isActive?: boolean;
};

export type StatesResponse = {
  states: LocationState[];
};

export type CitiesResponse = {
  cities: LocationCity[];
};

export type LocationRequest = {
  _id: string;
  cityName: string;
  state: string;
  stateId?: string | LocationState | null;
  isNewState?: boolean;
  status: "pending" | "approved" | "rejected" | string;
  reason?: string | null;
  adminNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LocationRequestsResponse = {
  requests: LocationRequest[];
};

export type AppNotification = {
  _id: string;
  type: "location_request_new" | "location_request_reviewed" | string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  meta?: {
    requestId?: string | null;
    cityName?: string | null;
    stateName?: string | null;
    status?: string | null;
    requesterName?: string | null;
  };
  createdAt?: string;
};

export type NotificationsResponse = {
  notifications: AppNotification[];
};

export type UnreadCountResponse = {
  count: number;
};

export type CatalogMake = {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
};

export type CatalogModel = {
  _id: string;
  name: string;
  slug: string;
  make?: string | CatalogMake;
  isActive?: boolean;
};

export type MakesResponse = {
  makes: CatalogMake[];
};

export type ModelsResponse = {
  models: CatalogModel[];
};

export type SavedCar = {
  _id: string;
  user?: string;
  listing: MyListing | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedCarsResponse = {
  savedCars: SavedCar[];
};

export type SavedSearch = {
  _id: string;
  user?: string;
  name: string;
  filters?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedSearchesResponse = {
  savedSearches: SavedSearch[];
};

export type ContactedSeller = {
  _id: string;
  fullName?: string;
  email?: string | null;
  phoneNumber?: string | null;
};

export type ContactedSellersResponse = {
  contactedSellers: ContactedSeller[];
};

export type InquiryListingSummary = {
  make?: string | null;
  model?: string | null;
  variant?: string | null;
  manufacturingYear?: number;
  slug?: string | null;
  askingPrice?: number | null;
  status?: string | null;
  frontImage?: string | null;
  path?: string | null;
  stars?: number | null;
} | null;

export type DashboardInquiry = {
  buyerName?: string | null;
  buyerProfile?: {
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  sellerProfile?: {
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  listing?: InquiryListingSummary;
  inquiryMessage?: string;
  status?: string;
  dateTime?: { createdAt?: string; updatedAt?: string };
  contactActivity?: unknown[];
};

export type InquiriesResponse = {
  inquiries: DashboardInquiry[];
};

export type DashboardAlert = {
  _id: string;
  name: string;
  filters?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AlertsResponse = {
  alerts: DashboardAlert[];
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
