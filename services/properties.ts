import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export const propertyService = {
  async fetchProperties(userId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_types(name)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProperty(propertyId: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_types(name)
      `)
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  async createProperty(property: Omit<PropertyInsert, 'user_id'>): Promise<Property> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...property,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProperty(propertyId: string, updates: PropertyUpdate): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProperty(propertyId: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('property_id', propertyId);

    if (error) throw error;
  },

  async getPropertyTypes() {
    const { data, error } = await supabase
      .from('property_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },
};