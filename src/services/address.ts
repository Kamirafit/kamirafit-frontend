import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { Address } from "@/types/entities";
export const addressService = {
 getAddresses:()=>unwrapApiResponse<Address[]>(apiClient.get("/orders/addresses")),
 createAddress:(a:Omit<Address,"id">)=>unwrapApiResponse<Address>(apiClient.post("/orders/addresses",a)),
 updateAddress:(id:string,a:Partial<Address>)=>unwrapApiResponse<Address>(apiClient.put("/orders/addresses/"+id,a)),
 deleteAddress:(id:string)=>unwrapApiResponse<{id:string}>(apiClient.delete("/orders/addresses/"+id)).then(x=>x.id),
};
export function useAddresses(){return useQuery<Address[]>({queryKey:["addresses"],queryFn:addressService.getAddresses,staleTime:300000});}
export function useCreateAddress(){const q=useQueryClient();return useMutation({mutationFn:addressService.createAddress,onSuccess:()=>q.invalidateQueries({queryKey:["addresses"]})});}
export function useUpdateAddress(){const q=useQueryClient();return useMutation({mutationFn:({id,data}:{id:string;data:Partial<Address>})=>addressService.updateAddress(id,data),onSuccess:()=>q.invalidateQueries({queryKey:["addresses"]})});}
export function useDeleteAddress(){const q=useQueryClient();return useMutation({mutationFn:addressService.deleteAddress,onSuccess:()=>q.invalidateQueries({queryKey:["addresses"]})});}
