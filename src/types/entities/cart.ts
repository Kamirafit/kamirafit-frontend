import { EntityId, ISODateTimeString } from "./common";
import { Size, Color } from "./product";

/** Client cart line. `id` is the product identifier retained for Redux compatibility. */
export interface CartItem {
  id: EntityId;
  size?: Size;
  color?: Color;
  quantity: number;
}

export interface Cart {
  id?: EntityId;
  userId?: EntityId;
  items: CartItem[];
  updatedAt?: ISODateTimeString;
}
