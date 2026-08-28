export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      academy_article_tags: {
        Row: {
          article_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academy_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academy_articles_with_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "academy_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          difficulty_level: string | null
          estimated_reading_time: number | null
          excerpt: string | null
          faq: Json | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          pinned: boolean | null
          pinned_at: string | null
          prerequisites: string[] | null
          published_at: string | null
          shares_count: number | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          difficulty_level?: string | null
          estimated_reading_time?: number | null
          excerpt?: string | null
          faq?: Json | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          pinned?: boolean | null
          pinned_at?: string | null
          prerequisites?: string[] | null
          published_at?: string | null
          shares_count?: number | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          difficulty_level?: string | null
          estimated_reading_time?: number | null
          excerpt?: string | null
          faq?: Json | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          pinned?: boolean | null
          pinned_at?: string | null
          prerequisites?: string[] | null
          published_at?: string | null
          shares_count?: number | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      academy_related_etfs: {
        Row: {
          article_id: string
          created_at: string | null
          etf_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          etf_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          etf_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_related_etfs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academy_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_related_etfs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academy_articles_with_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_related_etfs_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ad_clicks: {
        Row: {
          ad_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          impression_id: string | null
          ip_address: unknown
          page_url: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          ad_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          impression_id?: string | null
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          ad_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          impression_id?: string | null
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ad_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_clicks_impression_id_fkey"
            columns: ["impression_id"]
            isOneToOne: false
            referencedRelation: "ad_impressions"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          page_url: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          ad_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          ad_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ad_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          advertiser_id: string | null
          clicks_count: number | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          end_date: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          impressions_count: number | null
          link_url: string | null
          max_clicks: number | null
          max_impressions: number | null
          name: string
          placement: string
          priority: number | null
          script_code: string | null
          size: string | null
          start_date: string | null
          status: string | null
          target: string | null
          target_categories: Json | null
          target_pages: Json | null
          title: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          advertiser_id?: string | null
          clicks_count?: number | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          impressions_count?: number | null
          link_url?: string | null
          max_clicks?: number | null
          max_impressions?: number | null
          name: string
          placement: string
          priority?: number | null
          script_code?: string | null
          size?: string | null
          start_date?: string | null
          status?: string | null
          target?: string | null
          target_categories?: Json | null
          target_pages?: Json | null
          title?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string | null
          clicks_count?: number | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          impressions_count?: number | null
          link_url?: string | null
          max_clicks?: number | null
          max_impressions?: number | null
          name?: string
          placement?: string
          priority?: number | null
          script_code?: string | null
          size?: string | null
          start_date?: string | null
          status?: string | null
          target?: string | null
          target_categories?: Json | null
          target_pages?: Json | null
          title?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisers: {
        Row: {
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          broker_name: string
          clicked_at: string | null
          etf_id: string | null
          id: string
          referrer_url: string | null
          user_ip: string | null
        }
        Insert: {
          broker_name: string
          clicked_at?: string | null
          etf_id?: string | null
          id?: string
          referrer_url?: string | null
          user_ip?: string | null
        }
        Update: {
          broker_name?: string
          clicked_at?: string | null
          etf_id?: string | null
          id?: string
          referrer_url?: string | null
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          agent_type: string
          articles_count: number | null
          avatar_url: string | null
          bio: string | null
          can_publish: boolean | null
          created_at: string | null
          display_name: string
          email: string | null
          expertise: string[] | null
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          signature: string | null
          slug: string
          social_links: Json | null
          total_views: number | null
          updated_at: string | null
        }
        Insert: {
          agent_type?: string
          articles_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          can_publish?: boolean | null
          created_at?: string | null
          display_name: string
          email?: string | null
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          signature?: string | null
          slug: string
          social_links?: Json | null
          total_views?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          articles_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          can_publish?: boolean | null
          created_at?: string | null
          display_name?: string
          email?: string | null
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          signature?: string | null
          slug?: string
          social_links?: Json | null
          total_views?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cron_logs: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string
          id: string
          job_name: string
          message: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          job_name: string
          message?: string | null
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          job_name?: string
          message?: string | null
          status?: string
        }
        Relationships: []
      }
      etf_price_history: {
        Row: {
          created_at: string | null
          date: string
          etf_id: string | null
          id: string
          nav_price: number
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          etf_id?: string | null
          id?: string
          nav_price: number
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          etf_id?: string | null
          id?: string
          nav_price?: number
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "etf_price_history_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      etfs: {
        Row: {
          aum_millions: number | null
          average_rating: number | null
          base_currency: string | null
          benchmark_index: string | null
          bid_ask_spread: number | null
          category: string | null
          created_at: string | null
          currency: string | null
          data_quality_score: number | null
          data_staleness_days: number | null
          data_updated_at: string | null
          dividend_policy: string | null
          domicile: string | null
          id: string
          is_active: boolean | null
          isin: string
          kid_date: string | null
          kid_url: string | null
          listing_exchanges: Json | null
          manager_id: string | null
          market_price: number | null
          market_price_date: string | null
          name: string
          nav_date: string | null
          nav_price: number | null
          number_of_holdings: number | null
          official_name: string | null
          region: string | null
          replication_method: string | null
          return_1m: number | null
          return_1w: number | null
          return_1y: number | null
          return_3y: number | null
          return_5y: number | null
          return_ytd: number | null
          sector: string | null
          sharpe_ratio: number | null
          ter: number | null
          tickers: Json | null
          top_10_holdings: Json | null
          tracking_error: number | null
          updated_at: string | null
          volatility_1y: number | null
          volume_avg: number | null
          yahoo_ticker: string | null
        }
        Insert: {
          aum_millions?: number | null
          average_rating?: number | null
          base_currency?: string | null
          benchmark_index?: string | null
          bid_ask_spread?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          data_quality_score?: number | null
          data_staleness_days?: number | null
          data_updated_at?: string | null
          dividend_policy?: string | null
          domicile?: string | null
          id?: string
          is_active?: boolean | null
          isin: string
          kid_date?: string | null
          kid_url?: string | null
          listing_exchanges?: Json | null
          manager_id?: string | null
          market_price?: number | null
          market_price_date?: string | null
          name: string
          nav_date?: string | null
          nav_price?: number | null
          number_of_holdings?: number | null
          official_name?: string | null
          region?: string | null
          replication_method?: string | null
          return_1m?: number | null
          return_1w?: number | null
          return_1y?: number | null
          return_3y?: number | null
          return_5y?: number | null
          return_ytd?: number | null
          sector?: string | null
          sharpe_ratio?: number | null
          ter?: number | null
          tickers?: Json | null
          top_10_holdings?: Json | null
          tracking_error?: number | null
          updated_at?: string | null
          volatility_1y?: number | null
          volume_avg?: number | null
          yahoo_ticker?: string | null
        }
        Update: {
          aum_millions?: number | null
          average_rating?: number | null
          base_currency?: string | null
          benchmark_index?: string | null
          bid_ask_spread?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          data_quality_score?: number | null
          data_staleness_days?: number | null
          data_updated_at?: string | null
          dividend_policy?: string | null
          domicile?: string | null
          id?: string
          is_active?: boolean | null
          isin?: string
          kid_date?: string | null
          kid_url?: string | null
          listing_exchanges?: Json | null
          manager_id?: string | null
          market_price?: number | null
          market_price_date?: string | null
          name?: string
          nav_date?: string | null
          nav_price?: number | null
          number_of_holdings?: number | null
          official_name?: string | null
          region?: string | null
          replication_method?: string | null
          return_1m?: number | null
          return_1w?: number | null
          return_1y?: number | null
          return_3y?: number | null
          return_5y?: number | null
          return_ytd?: number | null
          sector?: string | null
          sharpe_ratio?: number | null
          ter?: number | null
          tickers?: Json | null
          top_10_holdings?: Json | null
          tracking_error?: number | null
          updated_at?: string | null
          volatility_1y?: number | null
          volume_avg?: number | null
          yahoo_ticker?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etfs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "fund_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_managers: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      interview_categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          faq: Json | null
          id: string
          key_points: Json | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          views_count: number | null
          youtube_video_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          faq?: Json | null
          id?: string
          key_points?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          youtube_video_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          faq?: Json | null
          id?: string
          key_points?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interview_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_article_tags: {
        Row: {
          article_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles_with_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles_with_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "news_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_email: string | null
          author_id: string | null
          author_name: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          faq: Json | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          pinned: boolean | null
          pinned_at: string | null
          published_at: string | null
          shares_count: number | null
          slug: string
          source_name: string | null
          source_published_at: string | null
          source_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          faq?: Json | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          pinned?: boolean | null
          pinned_at?: string | null
          published_at?: string | null
          shares_count?: number | null
          slug: string
          source_name?: string | null
          source_published_at?: string | null
          source_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          faq?: Json | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          pinned?: boolean | null
          pinned_at?: string | null
          published_at?: string | null
          shares_count?: number | null
          slug?: string
          source_name?: string | null
          source_published_at?: string | null
          source_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      news_related_etfs: {
        Row: {
          article_id: string
          created_at: string | null
          etf_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          etf_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          etf_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_related_etfs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_related_etfs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles_with_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_related_etfs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles_with_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_related_etfs_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      news_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      user_agent_assignments: {
        Row: {
          agent_id: string
          assigned_at: string | null
          assigned_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          agent_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          agent_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          marketing_emails: boolean | null
          preferred_currency: string | null
          preferred_language: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          agent_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          marketing_emails?: boolean | null
          preferred_currency?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          agent_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          marketing_emails?: boolean | null
          preferred_currency?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          created_at: string | null
          etf_id: string
          id: string
          rating: number
          review_text: string | null
          review_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          etf_id: string
          id?: string
          rating: number
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          etf_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watchlists: {
        Row: {
          added_at: string | null
          etf_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          etf_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          etf_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_watchlists_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_rankings: {
        Row: {
          community_score: number | null
          cost_score: number
          created_at: string | null
          etf_id: string | null
          id: string
          liquidity_score: number
          performance_score: number
          rank: number
          score: number
          week_start_date: string
        }
        Insert: {
          community_score?: number | null
          cost_score: number
          created_at?: string | null
          etf_id?: string | null
          id?: string
          liquidity_score: number
          performance_score: number
          rank: number
          score: number
          week_start_date: string
        }
        Update: {
          community_score?: number | null
          cost_score?: number
          created_at?: string | null
          etf_id?: string | null
          id?: string
          liquidity_score?: number
          performance_score?: number
          rank?: number
          score?: number
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_rankings_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      academy_articles_with_metadata: {
        Row: {
          author_id: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          content: string | null
          created_at: string | null
          difficulty_level: string | null
          estimated_reading_time: number | null
          excerpt: string | null
          faq: Json | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string | null
          meta_description: string | null
          meta_title: string | null
          pinned: boolean | null
          pinned_at: string | null
          prerequisites: string[] | null
          published_at: string | null
          related_etfs: Json | null
          shares_count: number | null
          slug: string | null
          status: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_stats: {
        Row: {
          advertiser_id: string | null
          advertiser_name: string | null
          clicks_progress: number | null
          created_at: string | null
          ctr_percentage: number | null
          end_date: string | null
          id: string | null
          impressions_progress: number | null
          max_clicks: number | null
          max_impressions: number | null
          name: string | null
          placement: string | null
          start_date: string | null
          status: string | null
          total_clicks: number | null
          total_impressions: number | null
          type: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_jobs_status: {
        Row: {
          job_name: string | null
          last_error: string | null
          last_run: string | null
          last_success: string | null
          total_errors: number | null
          total_success: number | null
        }
        Relationships: []
      }
      etf_ratings_summary: {
        Row: {
          average_rating: number | null
          etf_id: string | null
          five_stars: number | null
          four_stars: number | null
          last_rating_at: string | null
          one_star: number | null
          three_stars: number | null
          total_ratings: number | null
          two_stars: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_etf_id_fkey"
            columns: ["etf_id"]
            isOneToOne: false
            referencedRelation: "etfs"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews_with_metadata: {
        Row: {
          category_color: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          description: string | null
          faq: Json | null
          id: string | null
          key_points: Json | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          views_count: number | null
          youtube_video_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interview_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles_with_agent: {
        Row: {
          agent_avatar_url: string | null
          agent_display_name: string | null
          agent_name: string | null
          agent_signature: string | null
          agent_slug: string | null
          author_email: string | null
          author_id: string | null
          author_name: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          shares_count: number | null
          slug: string | null
          source_name: string | null
          source_published_at: string | null
          source_url: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles_with_metadata: {
        Row: {
          author_email: string | null
          author_id: string | null
          author_name: string | null
          category_color: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          faq: Json | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string | null
          meta_description: string | null
          meta_title: string | null
          pinned: boolean | null
          pinned_at: string | null
          published_at: string | null
          related_etfs: Json | null
          shares_count: number | null
          slug: string | null
          source_name: string | null
          source_published_at: string | null
          source_url: string | null
          status: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_publish_news_cron: { Args: never; Returns: undefined }
      calculate_community_score: { Args: { etf_uuid: string }; Returns: number }
      can_edit_articles: { Args: never; Returns: boolean }
      cleanup_old_cron_logs: { Args: never; Returns: undefined }
      fetch_news_cron: { Args: never; Returns: undefined }
      get_user_agents: {
        Args: { p_user_id: string }
        Returns: {
          agent_display_name: string
          agent_id: string
          agent_name: string
          agent_role: string
          agent_slug: string
          assigned_at: string
        }[]
      }
      import_gsheets_cron: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      search_academy_articles: {
        Args: { max_results?: number; search_query: string }
        Returns: {
          category_name: string
          difficulty_level: string
          excerpt: string
          id: string
          published_at: string
          relevance: number
          slug: string
          title: string
        }[]
      }
      search_articles: {
        Args: { max_results?: number; search_query: string }
        Returns: {
          category_name: string
          excerpt: string
          id: string
          published_at: string
          relevance: number
          slug: string
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
