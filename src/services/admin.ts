/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { adaptProduct, type AdminCategory, type AdminOrder as Order, type AdminUser, type Product } from "@/types/entities";
import type { AdminStatsDto } from "@/types/api/admin";
const admin = <T>(path:string, config?:any)=>unwrapApiResponse<T>(apiClient.get("/admin"+path,config));
export const adminService = {
 getStats:()=>admin<AdminStatsDto>("/stats"),
 getCategories:()=>admin<AdminCategory[]>("/categories"),
 createCategory:(x:any)=>unwrapApiResponse<AdminCategory>(apiClient.post("/admin/categories",x)),
 updateCategory:(id:string,x:any)=>unwrapApiResponse<AdminCategory>(apiClient.put("/admin/categories/"+id,x)),
 deleteCategory:(id:string)=>unwrapApiResponse<{id:string}>(apiClient.delete("/admin/categories/"+id)).then(x=>x.id),
 getProducts:()=>admin<any>("/products").then(r=>(Array.isArray(r)?r:r.data||[]).map(adaptProduct)),
 createProduct:(x:any)=>unwrapApiResponse<any>(apiClient.post("/admin/products",x)).then(adaptProduct),
 updateProduct:(id:string,x:any)=>unwrapApiResponse<any>(apiClient.put("/admin/products/"+id,x)).then(adaptProduct),
 toggleProductStatus:(id:string)=>unwrapApiResponse<any>(apiClient.patch("/admin/products/"+id+"/toggle")).then(adaptProduct),
 deleteProduct:(id:string)=>unwrapApiResponse<{id:string}>(apiClient.delete("/admin/products/"+id)).then(x=>x.id),
 getUsers:()=>admin<AdminUser[]>("/users"),
 updateUser:(id:string,x:any)=>unwrapApiResponse<AdminUser>(apiClient.put("/admin/users/"+id,x)),
 getOrders:()=>admin<any>("/orders").then(r=>Array.isArray(r)?r:r.data||[]),
 updateOrder:(id:string,x:any)=>unwrapApiResponse<Order>(apiClient.put("/admin/orders/"+id,x)),
 deleteOrder:(id:string)=>unwrapApiResponse<{id:string}>(apiClient.delete("/admin/orders/"+id)).then(x=>x.id),
};
export function useAdminStats(){return useQuery({queryKey:["admin","stats"],queryFn:adminService.getStats});}
export function useAdminCategories(){return useQuery({queryKey:["admin","categories"],queryFn:adminService.getCategories});}
export function useCreateAdminCategory(){const q=useQueryClient();return useMutation({mutationFn:adminService.createCategory,onSuccess:()=>q.invalidateQueries({queryKey:["admin","categories"]})});}
export function useUpdateAdminCategory(){const q=useQueryClient();return useMutation({mutationFn:({id,patch}:{id:string;patch:any})=>adminService.updateCategory(id,patch),onSuccess:()=>q.invalidateQueries({queryKey:["admin","categories"]})});}
export function useDeleteAdminCategory(){const q=useQueryClient();return useMutation({mutationFn:adminService.deleteCategory,onSuccess:()=>q.invalidateQueries({queryKey:["admin","categories"]})});}
export function useAdminProducts(){return useQuery<Product[]>({queryKey:["admin","products"],queryFn:adminService.getProducts});}
export function useCreateAdminProduct(){const q=useQueryClient();return useMutation({mutationFn:adminService.createProduct,onSuccess:()=>q.invalidateQueries({queryKey:["admin","products"]})});}
export function useUpdateAdminProduct(){const q=useQueryClient();return useMutation({mutationFn:({id,patch}:{id:string;patch:any})=>adminService.updateProduct(id,patch),onSuccess:()=>q.invalidateQueries({queryKey:["admin","products"]})});}
export function useToggleAdminProductStatus(){const q=useQueryClient();return useMutation({mutationFn:adminService.toggleProductStatus,onSuccess:()=>q.invalidateQueries({queryKey:["admin","products"]})});}
export function useDeleteAdminProduct(){const q=useQueryClient();return useMutation({mutationFn:adminService.deleteProduct,onSuccess:()=>q.invalidateQueries({queryKey:["admin","products"]})});}
export function useAdminUsers(){return useQuery({queryKey:["admin","users"],queryFn:adminService.getUsers});}
export function useUpdateAdminUser(){const q=useQueryClient();return useMutation({mutationFn:({id,patch}:{id:string;patch:any})=>adminService.updateUser(id,patch),onSuccess:()=>q.invalidateQueries({queryKey:["admin","users"]})});}
export function useAdminOrders(){return useQuery<Order[]>({queryKey:["admin","orders"],queryFn:adminService.getOrders});}
export function useUpdateAdminOrder(){const q=useQueryClient();return useMutation({mutationFn:({id,patch}:{id:string;patch:any})=>adminService.updateOrder(id,patch),onSuccess:()=>q.invalidateQueries({queryKey:["admin","orders"]})});}
export function useDeleteAdminOrder(){const q=useQueryClient();return useMutation({mutationFn:adminService.deleteOrder,onSuccess:()=>q.invalidateQueries({queryKey:["admin","orders"]})});}
