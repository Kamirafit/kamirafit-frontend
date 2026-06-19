import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { Address } from "@/types/entities";
import type {
  CreateAddressRequestDto, CreateAddressResponseDto, DeleteAddressResponseDto,
  GetAddressesResponseDto, UpdateAddressRequestDto, UpdateAddressResponseDto,
} from "@/types/api/commerce";

export const addressService = {
  getAddresses: async (): Promise<GetAddressesResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.addresses.getAll());
  },

  createAddress: async (address: CreateAddressRequestDto): Promise<CreateAddressResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.addresses.create(address));
  },

  updateAddress: async (id: string, address: UpdateAddressRequestDto["data"]): Promise<UpdateAddressResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.addresses.update(id, address));
  },

  deleteAddress: async (id: string): Promise<DeleteAddressResponseDto["data"]["id"]> => {
    return unwrapMockResponse(await mockApi.addresses.delete(id));
  },
};

export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: addressService.getAddresses,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation<Address, Error, Omit<Address, "id">>({
    mutationFn: addressService.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation<Address, Error, { id: string; data: Partial<Address> }>({
    mutationFn: ({ id, data }) => addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
