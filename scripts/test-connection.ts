#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase接続テスト開始\n');

// 環境変数チェック
console.log('環境変数チェック:');
console.log(`  VITE_SUPABASE_URL: ${supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}`);
console.log(`  URL: ${supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'N/A'}`);
console.log(`  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 設定済み' : '❌ 未設定'}`);
console.log(`  Key長: ${supabaseAnonKey ? supabaseAnonKey.length : 0} 文字\n`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// プロキシ設定
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

console.log('プロキシ設定:');
console.log(`  HTTPS_PROXY: ${process.env.HTTPS_PROXY || 'なし'}`);
console.log(`  HTTP_PROXY: ${process.env.HTTP_PROXY || 'なし'}`);
console.log(`  使用プロキシ: ${proxyUrl || 'なし'}\n`);

// プロキシ対応のSupabaseクライアント
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url: any, options: any = {}) => {
      return fetch(url, { ...options, agent } as any);
    }
  }
});

async function testConnection() {
  console.log('📊 テーブル接続テスト:\n');
  
  // 1. analytics_countsテーブルのテスト
  console.log('1. analytics_counts テーブル:');
  try {
    const { count, error } = await supabase
      .from('analytics_counts')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`   ❌ エラー: ${error.message}`);
      console.error(`   詳細: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ 接続成功 (レコード数: ${count || 0})`);
    }
  } catch (err) {
    console.error(`   ❌ 例外: ${err}`);
  }
  
  // 2. 簡単なINSERTテスト
  console.log('\n2. INSERT テスト (1件のみ):');
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      analytic_id: 'TEST_001',
      label: 1,
      count: 100
    };
    
    console.log(`   送信データ: ${JSON.stringify(testData)}`);
    
    const { data, error } = await supabase
      .from('analytics_counts')
      .insert([testData])
      .select();
    
    if (error) {
      console.error(`   ❌ INSERTエラー: ${error.message}`);
      console.error(`   詳細: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ INSERT成功: ${JSON.stringify(data)}`);
      
      // 削除（テストデータをクリーンアップ）
      if (data && data[0]) {
        const { error: deleteError } = await supabase
          .from('analytics_counts')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.error(`   ⚠️ クリーンアップ失敗: ${deleteError.message}`);
        } else {
          console.log('   ✅ テストデータを削除しました');
        }
      }
    }
  } catch (err) {
    console.error(`   ❌ 例外: ${err}`);
  }
  
  // 3. 各テーブルの存在確認
  console.log('\n3. 全テーブルの確認:');
  const tables = [
    'analytics_counts',
    'analytics_speeds',
    'analytics_mobility',
    'parking_spaces',
    'parking_groups',
    'zones'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ${table}: ❌ (${error.message})`);
      } else {
        console.log(`   ${table}: ✅`);
      }
    } catch (err) {
      console.log(`   ${table}: ❌ (${err})`);
    }
  }
  
  console.log('\n✨ テスト完了');
}

testConnection().catch(console.error);