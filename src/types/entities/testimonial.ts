export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTestimonialInput = {
  name: string;
  location: string;
  quote: string;
  rating?: number;
  order?: number;
  isActive?: boolean;
};

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;
