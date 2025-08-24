#!/usr/bin/env node
import { Database } from 'duckdb-async';
import { createClient } from '@supabase/supabase-js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

// プロキシ設定
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

console.log(`🔌 プロキシ使用: ${proxyUrl}`);
console.log(`📡 Supabase URL: ${supabaseUrl}`);

// プロキシ対応のSupabaseクライアント
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url: any, options: any = {}) => {
      return fetch(url, { ...options, agent } as any);
    }
  }
});

const DATA_DIR = '/home/yoshinaka/devel/flow_post/dummy_data_generator/dummy_data';

async function importSingleFile() {
  console.log('📊 単一ファイルのテストインポート\n');
  
  const db = await Database.create(':memory:');
  
  try {
    // 1ファイルだけテスト
    const filePath = path.join(DATA_DIR, 'processing/analytics/counts/2025-07-28-12/2025-07-28-12-00.parquet');
    console.log(`ファイル: ${filePath}`);
    
    const query = `
      SELECT 
        timestamp,
        analytic_id,
        label,
        count
      FROM read_parquet('${filePath}')
      LIMIT 10
    `;
    
    console.log('DuckDBでデータ読み込み中...');
    const result = await db.all(query);
    console.log(`  ✅ ${result.length}件のレコードを読み込み`);
    
    // BigIntをNumberに変換
    const processedResult = result.map((row: any) => ({
      timestamp: row.timestamp,
      analytic_id: row.analytic_id,
      label: Number(row.label),
      count: Number(row.count)
    }));
    
    console.log('\nデータサンプル:');
    console.log(JSON.stringify(processedResult[0], null, 2));
    
    console.log('\nSupabaseへインポート中...');
    
    // 1件ずつインポート（デバッグ用）
    let successCount = 0;
    for (const data of processedResult) {
      try {
        const { error } = await supabase
          .from('analytics_counts')
          .insert(data);
        
        if (error) {
          console.error(`  ❌ エラー: ${error.message}`);
          break;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`  ❌ 例外: ${err}`);
        break;
      }
    }
    
    console.log(`\n✅ ${successCount}/${processedResult.length}件のレコードをインポート`);
    
    // 確認
    const { count, error: countError } = await supabase
      .from('analytics_counts')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 テーブル内の総レコード数: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await db.close();
  }
}

importSingleFile().catch(console.error);