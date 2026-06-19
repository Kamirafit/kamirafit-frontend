import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@/types/entities";
import type {
  CreateAddressRequestDto, CreateAddressResponseDto, DeleteAddressResponseDto,
  GetAddressesResponseDto, UpdateAddressRequestDto, UpdateAddressResponseDto,
} from "@/types/api/commerce";
import { MOCK_ADDRESSES } from "@/features/account/data/mockAccount";

export const addressService = {
  getAddresses: async (): Promise<GetAddressesResponseDto["data"]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<Address[]>>("/addresses");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_ADDRESSES;
  },

  createAddress: async (address: CreateAddressRequestDto): Promise<CreateAddressResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newAddress: Address = {
      ...address,
      id: `addr-${Math.random().toString(36).substr(2, 9)}`,
    };
    return newAddress;
  },

  updateAddress: async (id: string, address: UpdateAddressRequestDto["data"]): Promise<UpdateAddressResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { id, ...address } as Address;
  },

  deleteAddress: async (id: string): Promise<DeleteAddressResponseDto["data"]["id"]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return id;
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
