export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          property_id: string;
          user_id: string;
          address: string;
          type_id: number | null;
          size_sqm: number | null;
          purchase_date: string | null;
          current_value_dkk: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          property_id?: string;
          user_id: string;
          address: string;
          type_id?: number | null;
          size_sqm?: number | null;
          purchase_date?: string | null;
          current_value_dkk?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          property_id?: string;
          user_id?: string;
          address?: string;
          type_id?: number | null;
          size_sqm?: number | null;
          purchase_date?: string | null;
          current_value_dkk?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      property_types: {
        Row: {
          type_id: number;
          name: string;
        };
        Insert: {
          type_id?: number;
          name: string;
        };
        Update: {
          type_id?: number;
          name?: string;
        };
      };
      tenants: {
        Row: {
          tenant_id: string;
          user_id: string;
          name: string;
          contact_info: Record<string, any>;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          tenant_id?: string;
          user_id: string;
          name: string;
          contact_info?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          tenant_id?: string;
          user_id?: string;
          name?: string;
          contact_info?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      leases: {
        Row: {
          lease_id: string;
          property_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string | null;
          monthly_rent_dkk: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          lease_id?: string;
          property_id: string;
          tenant_id: string;
          start_date: string;
          end_date?: string | null;
          monthly_rent_dkk: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          lease_id?: string;
          property_id?: string;
          tenant_id?: string;
          start_date?: string;
          end_date?: string | null;
          monthly_rent_dkk?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      financial_categories: {
        Row: {
          category_id: number;
          name: string;
          type: 'income' | 'expense';
        };
        Insert: {
          category_id?: number;
          name: string;
          type: 'income' | 'expense';
        };
        Update: {
          category_id?: number;
          name?: string;
          type?: 'income' | 'expense';
        };
      };
      financials: {
        Row: {
          transaction_id: string;
          property_id: string;
          category_id: number;
          type: 'income' | 'expense';
          amount_dkk: number;
          date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          transaction_id?: string;
          property_id: string;
          category_id: number;
          type: 'income' | 'expense';
          amount_dkk: number;
          date: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          transaction_id?: string;
          property_id?: string;
          category_id?: number;
          type?: 'income' | 'expense';
          amount_dkk?: number;
          date?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_properties: {
        Row: {
          user_id: string;
          property_id: string;
        };
        Insert: {
          user_id: string;
          property_id: string;
        };
        Update: {
          user_id?: string;
          property_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}