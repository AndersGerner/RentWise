import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Lease = Database['public']['Tables']['leases']['Row'];
type LeaseInsert = Database['public']['Tables']['leases']['Insert'];
type LeaseUpdate = Database['public']['Tables']['leases']['Update'];

export const leaseService = {
  async getLeases(propertyId: string): Promise<Lease[]> {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants(name, contact_info)
      `)
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLease(leaseId: string): Promise<Lease | null> {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants(name, contact_info),
        properties(address)
      `)
      .eq('lease_id', leaseId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  async createLease(lease: LeaseInsert): Promise<Lease> {
    const { data, error } = await supabase
      .from('leases')
      .insert(lease)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLease(leaseId: string, updates: LeaseUpdate): Promise<Lease> {
    const { data, error } = await supabase
      .from('leases')
      .update(updates)
      .eq('lease_id', leaseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLease(leaseId: string): Promise<void> {
    const { error } = await supabase
      .from('leases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('lease_id', leaseId);

    if (error) throw error;
  },

  async getCurrentLease(propertyId: string): Promise<Lease | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants(name, contact_info)
      `)
      .eq('property_id', propertyId)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};