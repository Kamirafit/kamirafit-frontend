import { EntityId, ISODateTimeString, ISODateString } from "./common";

export interface Review {
  id: EntityId;
  productId: EntityId;
  orderId?: EntityId;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  createdAt: ISODateTimeString;
  /** Legacy account-view alias. New APIs should use createdAt. */
  date?: ISODateString;
}
