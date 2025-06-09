import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/services/financials';
import { useAuth } from '@/context/supabase-provider';

export function useFinancials(propertyId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['financials', propertyId, startDate, endDate],
    queryFn: () => financialService.getFinancials(propertyId, startDate, endDate),
    enabled: !!propertyId,
  });
}

export function useCreateFinancial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialService.createFinancial,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financials', data.property_id] });
      queryClient.invalidateQueries({ queryKey: ['property-summary'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
    },
  });
}

export function useUpdateFinancial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, updates }: { transactionId: string; updates: any }) =>
      financialService.updateFinancial(transactionId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financials', data.property_id] });
      queryClient.invalidateQueries({ queryKey: ['property-summary'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
    },
  });
}

export function useDeleteFinancial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialService.deleteFinancial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] });
      queryClient.invalidateQueries({ queryKey: ['property-summary'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
    },
  });
}

export function useFinancialCategories() {
  return useQuery({
    queryKey: ['financial-categories'],
    queryFn: financialService.getFinancialCategories,
  });
}

export function usePropertyFinancialSummary(propertyId: string, year?: number) {
  return useQuery({
    queryKey: ['property-summary', propertyId, year],
    queryFn: () => financialService.getPropertyFinancialSummary(propertyId, year),
    enabled: !!propertyId,
  });
}

export function usePortfolioSummary() {
  const { session } = useAuth();
  
  return useQuery({
    queryKey: ['portfolio-summary', session?.user?.id],
    queryFn: () => financialService.getPortfolioSummary(session?.user?.id!),
    enabled: !!session?.user?.id,
  });
}