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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
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
          author_name: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
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
          author_name?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
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
          author_name?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
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
      user_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          etf_id: string | null
          id: string
          rating: number
          user_email: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          etf_id?: string | null
          id?: string
          rating: number
          user_email?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          etf_id?: string | null
          id?: string
          rating?: number
          user_email?: string | null
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
      news_articles_with_metadata: {
        Row: {
          author_email: string | null
          author_name: string | null
          category_color: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string | null
          meta_description: string | null
          meta_title: string | null
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
      calculate_community_score: { Args: { etf_uuid: string }; Returns: number }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
