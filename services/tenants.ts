import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Tenant = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export const tenantService = {
  async fetchTenants(userId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getTenant(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  async createTenant(tenant: Omit<TenantInsert, 'user_id'>): Promise<Tenant> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        ...tenant,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTenant(tenantId: string, updates: TenantUpdate): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTenant(tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('tenant_id', tenantId);

    if (error) throw error;
  },
};