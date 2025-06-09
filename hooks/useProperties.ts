import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '@/services/properties';
import { useAuth } from '@/context/supabase-provider';

export function useProperties() {
  const { session } = useAuth();
  
  return useQuery({
    queryKey: ['properties', session?.user?.id],
    queryFn: () => propertyService.fetchProperties(session?.user?.id!),
    enabled: !!session?.user?.id,
  });
}

export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyService.getProperty(propertyId),
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: propertyService.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', session?.user?.id] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: ({ propertyId, updates }: { propertyId: string; updates: any }) =>
      propertyService.updateProperty(propertyId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', session?.user?.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: propertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', session?.user?.id] });
    },
  });
}

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: propertyService.getPropertyTypes,
  });
}