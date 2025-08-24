#!/usr/bin/env node
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

console.log('🔍 シンプル接続テスト\n');
console.log('設定:');
console.log(`  Supabase URL: ${supabaseUrl?.substring(0, 40)}...`);
console.log(`  Proxy: ${proxyUrl}`);
console.log();

async function testDirectFetch() {
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
  
  // 1. Supabase RESTエンドポイントに直接アクセス
  const restUrl = `${supabaseUrl}/rest/v1/analytics_counts?limit=1`;
  
  console.log('1. REST APIテスト:');
  console.log(`   URL: ${restUrl}`);
  
  try {
    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      },
      agent: agent as any
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}`);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log(`   ✅ 成功: ${Array.isArray(data) ? `${data.length}件のデータ` : 'データ取得'}`);
      } catch {
        console.log(`   ✅ 接続成功（レスポンス解析エラー）`);
      }
    } else {
      console.log(`   ❌ エラー: ${response.status}`);
    }
  } catch (error: any) {
    console.error(`   ❌ 接続エラー: ${error.message}`);
    console.error(`   詳細: ${error.stack}`);
  }
  
  // 2. 簡単なINSERTテスト
  console.log('\n2. INSERT APIテスト:');
  
  const insertUrl = `${supabaseUrl}/rest/v1/analytics_counts`;
  const testData = {
    timestamp: new Date().toISOString(),
    analytic_id: 'TEST_SIMPLE',
    label: 1,
    count: 999
  };
  
  console.log(`   URL: ${insertUrl}`);
  console.log(`   Data: ${JSON.stringify(testData)}`);
  
  try {
    const response = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(testData),
      agent: agent as any
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok || response.status === 201) {
      console.log(`   ✅ INSERT成功`);
      
      // クリーンアップ
      const deleteUrl = `${supabaseUrl}/rest/v1/analytics_counts?analytic_id=eq.TEST_SIMPLE`;
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey!,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        agent: agent as any
      });
      
      if (deleteResponse.ok) {
        console.log(`   ✅ クリーンアップ完了`);
      }
    } else {
      const text = await response.text();
      console.log(`   ❌ エラー: ${text}`);
    }
  } catch (error: any) {
    console.error(`   ❌ 接続エラー: ${error.message}`);
  }
}

testDirectFetch();