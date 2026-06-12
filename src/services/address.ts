import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Address } from "@/types/api";
import { MOCK_ADDRESSES } from "@/features/account/data/mockAccount";

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<Address[]>>("/addresses");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_ADDRESSES as unknown as Address[];
  },

  createAddress: async (address: Omit<Address, "id">): Promise<Address> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newAddress: Address = {
      ...address,
      id: `addr-${Math.random().toString(36).substr(2, 9)}`,
    };
    return newAddress;
  },

  updateAddress: async (id: string, address: Partial<Address>): Promise<Address> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { id, ...address } as Address;
  },

  deleteAddress: async (id: string): Promise<string> => {
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
