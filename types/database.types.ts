// Auto-generated Supabase Database types
// Re-generate with: npx supabase gen types typescript --project-id auvugzgnorizyxwchper

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'user' | 'company' | 'admin';
          avatar_url: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'user' | 'company' | 'admin';
          avatar_url?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          role?: 'user' | 'company' | 'admin';
          avatar_url?: string | null;
          verified?: boolean;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          email: string;
          phone: string | null;
          city: string | null;
          logo: string | null;
          status: 'pending' | 'approved' | 'suspended';
          verified: boolean;
          rating: number;
          total_tours: number;
          total_bookings: number;
          total_revenue: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          email: string;
          phone?: string | null;
          city?: string | null;
          logo?: string | null;
          status?: 'pending' | 'approved' | 'suspended';
          verified?: boolean;
          rating?: number;
          total_tours?: number;
          total_bookings?: number;
          total_revenue?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          city?: string | null;
          logo?: string | null;
          status?: 'pending' | 'approved' | 'suspended';
          verified?: boolean;
          rating?: number;
          total_tours?: number;
          total_bookings?: number;
          total_revenue?: number;
        };
      };
      tours: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          destination: string;
          region: string;
          price: number;
          duration: number;
          rating: number;
          review_count: number;
          image_url: string | null;
          category: string;
          tags: string[];
          max_group: number;
          difficulty: string;
          highlights: string[];
          included: string[];
          safety_score: number;
          available: boolean;
          featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          destination: string;
          region: string;
          price: number;
          duration: number;
          rating?: number;
          review_count?: number;
          image_url?: string | null;
          category: string;
          tags?: string[];
          max_group?: number;
          difficulty?: string;
          highlights?: string[];
          included?: string[];
          safety_score?: number;
          available?: boolean;
          featured?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          destination?: string;
          region?: string;
          price?: number;
          duration?: number;
          rating?: number;
          review_count?: number;
          image_url?: string | null;
          category?: string;
          tags?: string[];
          max_group?: number;
          difficulty?: string;
          highlights?: string[];
          included?: string[];
          safety_score?: number;
          available?: boolean;
          featured?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          tour_id: string;
          user_id: string;
          company_id: string;
          group_size: number;
          total_price: number;
          travel_date: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          payment_status: 'paid' | 'pending' | 'refunded';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          user_id: string;
          company_id: string;
          group_size: number;
          total_price: number;
          travel_date: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          payment_status?: 'paid' | 'pending' | 'refunded';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          payment_status?: 'paid' | 'pending' | 'refunded';
          notes?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          tour_id: string;
          user_id: string;
          booking_id: string | null;
          rating: number;
          comment: string;
          sentiment: 'positive' | 'neutral' | 'negative';
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          user_id: string;
          booking_id?: string | null;
          rating: number;
          comment: string;
          sentiment?: 'positive' | 'neutral' | 'negative';
          helpful_count?: number;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
          sentiment?: 'positive' | 'neutral' | 'negative';
          helpful_count?: number;
        };
      };
      safety_zones: {
        Row: {
          id: string;
          area: string;
          score: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          area: string;
          score: number;
          status: string;
          updated_at?: string;
        };
        Update: {
          score?: number;
          status?: string;
          updated_at?: string;
        };
      };
      safety_alerts: {
        Row: {
          id: string;
          area: string;
          type: string;
          severity: 'low' | 'medium' | 'high';
          description: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          area: string;
          type: string;
          severity: 'low' | 'medium' | 'high';
          description: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          type?: string;
          severity?: 'low' | 'medium' | 'high';
          description?: string;
          active?: boolean;
        };
      };
      itinerary_days: {
        Row: {
          id: string;
          tour_id: string;
          day_number: number;
          title: string;
          places: string[];
          travel_time: string | null;
          accommodation: string | null;
          meals: string[];
          weather: string | null;
          weather_icon: string | null;
        };
        Insert: {
          id?: string;
          tour_id: string;
          day_number: number;
          title: string;
          places?: string[];
          travel_time?: string | null;
          accommodation?: string | null;
          meals?: string[];
          weather?: string | null;
          weather_icon?: string | null;
        };
        Update: {
          title?: string;
          places?: string[];
          travel_time?: string | null;
          accommodation?: string | null;
          meals?: string[];
          weather?: string | null;
          weather_icon?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
