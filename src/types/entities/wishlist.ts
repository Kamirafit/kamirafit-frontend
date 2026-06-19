import { EntityId, ISODateTimeString } from "./common";

export interface Wishlist {
  id?: EntityId;
  userId?: EntityId;
  productIds: EntityId[];
  updatedAt?: ISODateTimeString;
}
