import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/database';

type Financial = Database['public']['Tables']['financials']['Row'];
type FinancialInsert = Database['public']['Tables']['financials']['Insert'];
type FinancialUpdate = Database['public']['Tables']['financials']['Update'];
type FinancialCategory = Database['public']['Tables']['financial_categories']['Row'];

export const financialService = {
  async getFinancials(propertyId: string, startDate?: string, endDate?: string): Promise<Financial[]> {
    let query = supabase
      .from('financials')
      .select(`
        *,
        financial_categories(name, type)
      `)
      .eq('property_id', propertyId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createFinancial(financial: FinancialInsert): Promise<Financial> {
    const { data, error } = await supabase
      .from('financials')
      .insert(financial)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFinancial(transactionId: string, updates: FinancialUpdate): Promise<Financial> {
    const { data, error } = await supabase
      .from('financials')
      .update(updates)
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFinancial(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('financials')
      .delete()
      .eq('transaction_id', transactionId);

    if (error) throw error;
  },

  async getFinancialCategories(): Promise<FinancialCategory[]> {
    const { data, error } = await supabase
      .from('financial_categories')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getPropertyFinancialSummary(propertyId: string, year?: number) {
    const startDate = year ? `${year}-01-01` : undefined;
    const endDate = year ? `${year}-12-31` : undefined;

    const { data, error } = await supabase
      .from('financials')
      .select('type, amount_dkk')
      .eq('property_id', propertyId)
      .gte('date', startDate || '1900-01-01')
      .lte('date', endDate || '2100-12-31');

    if (error) throw error;

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
    };

    data?.forEach((transaction) => {
      if (transaction.type === 'income') {
        summary.totalIncome += Number(transaction.amount_dkk);
      } else {
        summary.totalExpenses += Number(transaction.amount_dkk);
      }
    });

    summary.netProfit = summary.totalIncome - summary.totalExpenses;
    return summary;
  },

  async getPortfolioSummary(userId: string) {
    // Get all properties for the user
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('property_id, current_value_dkk')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (propertiesError) throw propertiesError;

    if (!properties || properties.length === 0) {
      return {
        totalProperties: 0,
        totalValue: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageReturn: 0,
      };
    }

    const propertyIds = properties.map(p => p.property_id);
    
    // Get all financials for these properties
    const { data: financials, error: financialsError } = await supabase
      .from('financials')
      .select('type, amount_dkk, property_id')
      .in('property_id', propertyIds);

    if (financialsError) throw financialsError;

    const summary = {
      totalProperties: properties.length,
      totalValue: properties.reduce((sum, p) => sum + (Number(p.current_value_dkk) || 0), 0),
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      averageReturn: 0,
    };

    financials?.forEach((transaction) => {
      if (transaction.type === 'income') {
        summary.totalIncome += Number(transaction.amount_dkk);
      } else {
        summary.totalExpenses += Number(transaction.amount_dkk);
      }
    });

    summary.netProfit = summary.totalIncome - summary.totalExpenses;
    
    // Calculate average return rate (annual profit / total value)
    if (summary.totalValue > 0) {
      summary.averageReturn = (summary.netProfit / summary.totalValue) * 100;
    }

    return summary;
  },
};