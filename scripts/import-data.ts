#!/usr/bin/env node
import { Database } from 'duckdb-async';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const DATA_DIR = '/home/yoshinaka/devel/flow_post/dummy_data_generator/dummy_data';

async function importAnalyticsCounts(db: Database, targetDate: string = '2025-07-28') {
  console.log('📊 Analytics Countsデータをインポート中...');
  
  const countsDir = path.join(DATA_DIR, 'processing/analytics/counts');
  const hours = fs.readdirSync(countsDir).filter(dir => dir.startsWith(targetDate));
  
  for (const hour of hours) {
    const hourDir = path.join(countsDir, hour);
    const files = fs.readdirSync(hourDir).filter(f => f.endsWith('.parquet'));
    
    for (const file of files) {
      const filePath = path.join(hourDir, file);
      console.log(`  処理中: ${file}`);
      
      // DuckDBでParquetファイルを読み込み
      const query = `
        SELECT 
          timestamp,
          analytic_id,
          label,
          count
        FROM read_parquet('${filePath}')
      `;
      
      const result = await db.all(query);
      
      // Supabaseに挿入（バッチ処理）
      if (result.length > 0) {
        const { error } = await supabase
          .from('analytics_counts')
          .insert(result);
        
        if (error) {
          console.error(`    エラー: ${error.message}`);
        } else {
          console.log(`    ✓ ${result.length}件のレコードをインポート`);
        }
      }
    }
  }
}

async function importAnalyticsSpeeds(db: Database, targetDate: string = '2025-07-28') {
  console.log('🚗 Analytics Speedsデータをインポート中...');
  
  const speedsDir = path.join(DATA_DIR, 'processing/analytics/speeds');
  const hours = fs.readdirSync(speedsDir).filter(dir => dir.startsWith(targetDate));
  
  for (const hour of hours.slice(0, 2)) { // デモ用に最初の2時間分のみ
    const hourDir = path.join(speedsDir, hour);
    const files = fs.readdirSync(hourDir).filter(f => f.endsWith('.parquet'));
    
    for (const file of files) {
      const filePath = path.join(hourDir, file);
      console.log(`  処理中: ${file}`);
      
      const query = `
        SELECT 
          timestamp,
          analytic_id,
          label,
          max as max_speed,
          mean as mean_speed,
          v85 as v85_speed
        FROM read_parquet('${filePath}')
      `;
      
      const result = await db.all(query);
      
      if (result.length > 0) {
        const { error } = await supabase
          .from('analytics_speeds')
          .insert(result);
        
        if (error) {
          console.error(`    エラー: ${error.message}`);
        } else {
          console.log(`    ✓ ${result.length}件のレコードをインポート`);
        }
      }
    }
  }
}

async function importParkingSpaces(db: Database, targetDate: string = '2025-07-28') {
  console.log('🅿️ Parking Spacesデータをインポート中...');
  
  const parkingDir = path.join(DATA_DIR, 'processing/parking/parking_spaces');
  const hours = fs.readdirSync(parkingDir).filter(dir => dir.startsWith(targetDate));
  
  for (const hour of hours.slice(0, 2)) { // デモ用に最初の2時間分のみ
    const hourDir = path.join(parkingDir, hour);
    const files = fs.readdirSync(hourDir).filter(f => f.endsWith('.parquet'));
    
    for (const file of files) {
      const filePath = path.join(hourDir, file);
      console.log(`  処理中: ${file}`);
      
      const query = `
        SELECT 
          timestamp,
          zone_id,
          occupied,
          parked_label,
          is_real_occupied_transition,
          last_occupied_state_transition_time,
          occupied_state_duration,
          last_24h_cumulative_occupied_duration,
          last_24h_max_occupied_duration
        FROM read_parquet('${filePath}')
        LIMIT 100
      `; // デモ用に各ファイル100件まで
      
      const result = await db.all(query);
      
      if (result.length > 0) {
        const { error } = await supabase
          .from('parking_spaces')
          .insert(result);
        
        if (error) {
          console.error(`    エラー: ${error.message}`);
        } else {
          console.log(`    ✓ ${result.length}件のレコードをインポート`);
        }
      }
    }
  }
}

async function importParkingGroups(db: Database, targetDate: string = '2025-07-28') {
  console.log('🏢 Parking Groupsデータをインポート中...');
  
  const parkingDir = path.join(DATA_DIR, 'processing/parking/parkings');
  const hours = fs.readdirSync(parkingDir).filter(dir => dir.startsWith(targetDate));
  
  for (const hour of hours.slice(0, 2)) { // デモ用に最初の2時間分のみ
    const hourDir = path.join(parkingDir, hour);
    const files = fs.readdirSync(hourDir).filter(f => f.endsWith('.parquet'));
    
    for (const file of files) {
      const filePath = path.join(hourDir, file);
      console.log(`  処理中: ${file}`);
      
      const query = `
        SELECT 
          timestamp,
          group_zone_id,
          occupied_zone_ids,
          occupied_zones,
          available_zones,
          last_24h_cumulative_occupied_duration,
          last_24h_max_occupied_duration
        FROM read_parquet('${filePath}')
        LIMIT 50
      `; // デモ用に各ファイル50件まで
      
      const result = await db.all(query);
      
      if (result.length > 0) {
        // occupied_zone_idsを文字列配列に変換
        const processedResult = result.map((row: any) => ({
          ...row,
          occupied_zone_ids: row.occupied_zone_ids || [],
          available_zone_ids: []
        }));
        
        const { error } = await supabase
          .from('parking_groups')
          .insert(processedResult);
        
        if (error) {
          console.error(`    エラー: ${error.message}`);
        } else {
          console.log(`    ✓ ${processedResult.length}件のレコードをインポート`);
        }
      }
    }
  }
}

async function main() {
  console.log('🚀 Flow Postデータインポート開始');
  console.log(`📁 データディレクトリ: ${DATA_DIR}`);
  
  const db = await Database.create(':memory:');
  
  try {
    // 各データタイプをインポート
    await importAnalyticsCounts(db, '2025-07-28');
    await importAnalyticsSpeeds(db, '2025-07-28');
    await importParkingSpaces(db, '2025-07-28');
    await importParkingGroups(db, '2025-07-28');
    
    console.log('✅ データインポート完了！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await db.close();
  }
}

// スクリプト実行
main().catch(console.error);