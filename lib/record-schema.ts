import {z} from 'zod';
const text=z.string().trim().min(1).max(3000);
const id=z.string().uuid();
const url=z.string().url().max(2000).refine(v=>v.startsWith('https://'),'Use HTTPS');
export const schemas={
 products:z.object({sku:text,brand:text,description:text,supplierCode:z.string().max(100),applications:z.string().max(3000),applicationsVerified:z.boolean()}),
 assets:z.object({productId:id,url,source:text,rightsConfirmed:z.literal(true),realPhoto:z.literal(true)}),
 pieces:z.object({productId:id,assetId:id,channel:z.enum(['Mercado Livre','Shopee','Amazon','Instagram','WhatsApp','Site']),width:z.number().int().min(250).max(8000),height:z.number().int().min(250).max(8000),copy:z.string().max(3000)}),
 descriptions:z.object({productId:id,channel:text,content:text}),
 campaigns:z.object({objective:text,channel:text,startDate:z.string().date(),endDate:z.string().date()}).refine(v=>v.endDate>=v.startDate,'Período inválido'),
 videos:z.object({productId:id,assetId:id,script:text,url:url.optional()})
};
export const checklist=z.object({fidelity:z.literal(true),portuguese:z.literal(true),brand:z.literal(true),rights:z.literal(true),dimensions:z.literal(true)});
