/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { adaptProduct, type Product } from "@/types/entities";
import type { CreateProductRequestDto, DeleteProductResponseDto, UpdateProductRequestDto } from "@/types/api/catalog";

const list = (params?: Record<string, unknown>): Promise<Product[]> => unwrapApiResponse<any>(apiClient.get("/products", { params })).then((r) => (Array.isArray(r) ? r : r.data || []).map(adaptProduct));
export const productService = {
  getProducts: () => list(),
  getFeaturedProducts: () => unwrapApiResponse<any[]>(apiClient.get("/products/featured")).then((x) => x.map(adaptProduct)),
  getProduct: (id: string) => unwrapApiResponse<any>(apiClient.get("/products/" + id)).then(adaptProduct),
  getRelatedProducts: (id: string, limit = 4) => unwrapApiResponse<any[]>(apiClient.get("/products/" + id + "/related", { params: { limit } })).then((x) => x.map(adaptProduct)),
  createProduct: (product: CreateProductRequestDto) => unwrapApiResponse<any>(apiClient.post("/products", product)).then(adaptProduct),
  updateProduct: (id: string, product: UpdateProductRequestDto["data"]) => unwrapApiResponse<any>(apiClient.put("/products/" + id, product)).then(adaptProduct),
  deleteProduct: (id: string): Promise<DeleteProductResponseDto["data"]["id"]> => unwrapApiResponse<any>(apiClient.delete("/products/" + id)).then((x) => x.id),
};
export function useProducts() { return useQuery<Product[]>({ queryKey:["products"], queryFn:productService.getProducts, staleTime:300000 }); }
export function useProduct(id:string) { return useQuery<Product>({ queryKey:["product",id], queryFn:()=>productService.getProduct(id), enabled:!!id, staleTime:300000 }); }
export function useCreateProduct(){const q=useQueryClient();return useMutation({mutationFn:productService.createProduct,onSuccess:()=>q.invalidateQueries({queryKey:["products"]})});}
export function useUpdateProduct(){const q=useQueryClient();return useMutation({mutationFn:({id,data}:{id:string;data:UpdateProductRequestDto["data"]})=>productService.updateProduct(id,data),onSuccess:(d)=>{q.invalidateQueries({queryKey:["products"]});q.invalidateQueries({queryKey:["product",d.id]});}});}
export function useDeleteProduct(){const q=useQueryClient();return useMutation({mutationFn:productService.deleteProduct,onSuccess:()=>q.invalidateQueries({queryKey:["products"]})});}
