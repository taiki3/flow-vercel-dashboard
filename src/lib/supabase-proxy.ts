import { createClient } from '@supabase/supabase-js';
import { HttpsProxyAgent } from 'https-proxy-agent';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// プロキシ設定
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

// Debug: Log if environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase環境変数が設定されていません。.envファイルを確認してください。');
  console.warn('必要な環境変数: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// プロキシ対応のSupabaseクライアント
export const supabaseWithProxy = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url: any, options: any = {}) => {
      if (agent && typeof window === 'undefined') {
        // Node.js環境でのみプロキシを使用
        const fetch = (await import('node-fetch')).default;
        return fetch(url, { ...options, agent });
      }
      // ブラウザ環境では通常のfetchを使用
      return fetch(url, options);
    }
  }
});