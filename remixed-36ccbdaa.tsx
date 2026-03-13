import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화 (필수)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY 환경변수가 필요합니다.');
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const AUTO_LOGOUT_MS = 10 * 60 * 1000; // 10분
const LOGOUT_WARNING_MS = 9 * 60 * 1000; // 9분 (경고)

// 코스맥스 비용 구조
const COSMAX_COST = {
  initial: { processingFee: 34000, bulkContainer: 1000, shipping: 0 },      // 초도: 제조가공비 34,000 + 벌크통 1,000 + 운송비 별도
  reorder: { processingFee: 42000, bulkContainer: 1000, shipping: 1500 },   // 재발주: 제조가공비 42,000 + 벌크통 1,000 + 운송비 1,500
};

const productData = [
  { no: 1, korName: '본연 1', engName: 'intrinsic no.1', labNum: 'CRM250620AG01LYS02', contentPrice: 31000, totalInitial: 66000, totalReorder: 75500 },
  { no: 2, korName: '본연 2', engName: 'intrinsic no.2', labNum: 'CRM250626AA02LYL03', contentPrice: 50000, totalInitial: 85000, totalReorder: 94500 },
  { no: 3, korName: '본연 3', engName: 'intrinsic no.3', labNum: 'CRM250513AB01KYJ02', contentPrice: 24000, totalInitial: 59000, totalReorder: 68500 },
  { no: 4, korName: '본연 4', engName: 'intrinsic no.4', labNum: 'CRM250707AA02KJH04', contentPrice: 29000, totalInitial: 64000, totalReorder: 73500 },
  { no: 5, korName: '본연 5', engName: 'intrinsic no.5', labNum: 'CRM250630AB02HJH01', contentPrice: 25000, totalInitial: 60000, totalReorder: 69500 },
  { no: 6, korName: '본연 6', engName: 'intrinsic no.6', labNum: 'CRM250513AA01KYJ02', contentPrice: 29000, totalInitial: 64000, totalReorder: 73500 },
  { no: 7, korName: '본연 7', engName: 'intrinsic no.7', labNum: 'CRM250721AA01HSW01', contentPrice: 33000, totalInitial: 68000, totalReorder: 77500 },
  { no: 8, korName: '본연 8', engName: 'intrinsic no.8', labNum: 'CRM250627AB02LYS02', contentPrice: 24000, totalInitial: 59000, totalReorder: 68500 },
  { no: 9, korName: '본연 0', engName: 'intrinsic no.0', labNum: 'CRM250626AC02LYL03', contentPrice: 26000, totalInitial: 61000, totalReorder: 70500 },
  { no: 10, korName: '본연 9', engName: 'intrinsic no.9', labNum: 'CRM250701AD01KEL01', contentPrice: 27000, totalInitial: 62000, totalReorder: 71500 },
  { no: 11, korName: '본연 10', engName: 'intrinsic no.10', labNum: 'CRM250619AC01HJH01', contentPrice: 24000, totalInitial: 59000, totalReorder: 68500 },
  { no: 12, korName: '본연 11', engName: 'intrinsic no.11', labNum: 'CRM250619AB01KBH01', contentPrice: 22000, totalInitial: 57000, totalReorder: 66500 },
  { no: 13, korName: '본연 12', engName: 'intrinsic no.12', labNum: 'CRM250219AC01JHK01', contentPrice: 23000, totalInitial: 58000, totalReorder: 67500 },
  { no: 14, korName: '본연 13', engName: 'intrinsic no.13', labNum: 'CRM250514AB01KYJ02', contentPrice: 23000, totalInitial: 58000, totalReorder: 67500 },
  { no: 15, korName: '본연 14', engName: 'intrinsic no.14', labNum: 'CRM250514AC01KYJ02', contentPrice: 27000, totalInitial: 62000, totalReorder: 71500 },
  { no: 16, korName: '본연 15', engName: 'intrinsic no.15', labNum: 'CRM250626AD02LYL03', contentPrice: 24000, totalInitial: 59000, totalReorder: 68500 },
  { no: 17, korName: '본연 16', engName: 'intrinsic no.16', labNum: 'CRM250701AA01JHK01', contentPrice: 38000, totalInitial: 73000, totalReorder: 82500 },
  { no: 18, korName: '본연 17', engName: 'intrinsic no.17', labNum: 'CRM250626AB02LYL03', contentPrice: 29000, totalInitial: 64000, totalReorder: 73500 },
  { no: 19, korName: '본연 18', engName: 'intrinsic no.18', labNum: 'CRM250624AC01ASY01', contentPrice: 25000, totalInitial: 60000, totalReorder: 69500 },
  { no: 20, korName: '본연 19', engName: 'intrinsic no.19', labNum: 'CRM250708AE02KJH04', contentPrice: 23000, totalInitial: 58000, totalReorder: 67500 },
  { no: 21, korName: '본연 20', engName: 'intrinsic no.20', labNum: 'CRM250627AC04LYS02', contentPrice: 24000, totalInitial: 59000, totalReorder: 68500 },
  { no: 22, korName: '본연 21', engName: 'intrinsic no.21', labNum: 'CRM250702AA02KJH04', contentPrice: 23000, totalInitial: 58000, totalReorder: 67500 },
  { no: 23, korName: '본연 22', engName: 'intrinsic no.22', labNum: 'CRM250618AC01HSJ01', contentPrice: 42000, totalInitial: 77000, totalReorder: 86500 },
  { no: 24, korName: '본연 23', engName: 'intrinsic no.23', labNum: 'CRM250626AA02ASY01', contentPrice: 26000, totalInitial: 61000, totalReorder: 70500 },
  { no: 25, korName: '본연 24', engName: 'intrinsic no.24', labNum: 'CRM250624AG01LYS02', contentPrice: 24000, totalInitial: 59000, totalReorder: 68500 },
  { no: 26, korName: '본연 25', engName: 'intrinsic no.25', labNum: 'CRM250710AC02KJH04', contentPrice: 36000, totalInitial: 71000, totalReorder: 80500 },
  { no: 27, korName: '본연 26', engName: 'intrinsic no.26', labNum: 'CRM250630AA01HJH01', contentPrice: 29000, totalInitial: 64000, totalReorder: 73500 },
  { no: 28, korName: '본연 27', engName: 'intrinsic no.27', labNum: 'CRM250327S02HSW', contentPrice: 42000, totalInitial: 77000, totalReorder: 86500 },
  { no: 29, korName: '본연 28', engName: 'intrinsic no.28', labNum: 'CRM250625AA02KBH01', contentPrice: 27000, totalInitial: 62000, totalReorder: 71500 },
  { no: 30, korName: '본연 29', engName: 'intrinsic no.29', labNum: 'CRM250627AA01HSJ01', contentPrice: 26000, totalInitial: 61000, totalReorder: 70500 },
];

// 제품별 벌크 단가 가져오기 (초도/재발주에 따라)
const getProductBulkPrice = (product, isInitialOrder) => {
  return isInitialOrder ? product.totalInitial : product.totalReorder;
};

const capacities = [
  { value: 7, label: '7g' },
  { value: 15, label: '15g' },
  { value: 30, label: '30g' },
];

// 실제 충진량 (최소중량 + 0.5g)
const getActualCapacity = (cap) => cap + 0.5;

// 충전가공비 + 인/아웃박스 수량별 단가 (텐져블스토리 Nego 견적 기준, 50g 기준 per unit)
const FILLING_COST_TIERS = [
  { label: '10만개 이상', minQty: 100000, fillingFee: 320, inOutBox: 20 },
  { label: '5,000~10,000개', minQty: 5000, fillingFee: 350, inOutBox: 20 },
  { label: '3,000개', minQty: 3000, fillingFee: 350, inOutBox: 20 },
  { label: '1,000개', minQty: 1000, fillingFee: 380, inOutBox: 20 },
  { label: '1,000개 미만', minQty: 0, fillingFee: 380, inOutBox: 20 },
];

const getFillingCostTier = (totalQty) => {
  return FILLING_COST_TIERS.find(t => totalQty >= t.minQty) || FILLING_COST_TIERS[FILLING_COST_TIERS.length - 1];
};

// Supply Chain Diagram Component with Animated Lines
function SupplyChainDiagram({ isInitialOrder }) {
  const [targetDate, setTargetDate] = useState('');
  const [bulkOrderKg, setBulkOrderKg] = useState(60); // 벌크 발주량 (기본 60kg MOQ)
  
  // 벌크 수량 조절 함수 (최소 60kg, 이후 10kg 단위)
  const adjustBulk = (delta) => {
    const newValue = bulkOrderKg + delta;
    if (newValue >= 60) {
      setBulkOrderKg(newValue);
    }
  };
  
  // 리드타임 데이터 (일 단위, 최대값 기준)
  const leadTimes = {
    cosmax: { initial: 21, reorder: 21 },      // 2-3주 → 21일
    filling: { initial: 14, reorder: 14 },     // 충진/실링 1-2주 → 14일
    yeongcheon: { initial: 35, reorder: 14 },  // 4-5주 → 35일, 재발주 2주 → 14일
    yeonhee: { initial: 28, reorder: 14 },     // 3-4주 → 28일, 재발주 2주 → 14일
    duksu: { initial: 21, reorder: 14 },       // 2-3주 → 21일, 재발주 1-2주 → 14일
  };

  // 날짜 계산 함수
  const calculateDates = () => {
    if (!targetDate) return null;

    const target = new Date(targetDate);
    const fillingLeadTime = isInitialOrder ? leadTimes.filling.initial : leadTimes.filling.reorder;

    // 충진/실링 완료 필요일 (출하일 - 충진 리드타임)
    const materialDeadline = new Date(target);
    materialDeadline.setDate(materialDeadline.getDate() - fillingLeadTime);
    
    // 각 업체별 발주 마감일 (자재 입고일 - 해당 업체 리드타임)
    const getOrderDeadline = (supplier) => {
      const lt = isInitialOrder ? leadTimes[supplier].initial : leadTimes[supplier].reorder;
      const deadline = new Date(materialDeadline);
      deadline.setDate(deadline.getDate() - lt);
      return deadline;
    };
    
    return {
      target,
      materialDeadline,
      cosmax: getOrderDeadline('cosmax'),
      yeongcheon: getOrderDeadline('yeongcheon'),
      yeonhee: getOrderDeadline('yeonhee'),
      duksu: getOrderDeadline('duksu'),
    };
  };
  
  const dates = calculateDates();
  
  // 날짜 포맷팅
  const formatDate = (date) => {
    if (!date) return '-';
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  const formatFullDate = (date) => {
    if (!date) return '-';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 오늘 날짜와 비교하여 마감일이 지났는지 확인
  const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  // 오늘부터 며칠 남았는지
  const getDaysRemaining = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ padding: '24px' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#d4af37',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        CORE 화장품 공급망 & 물류 흐름도
      </h3>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '20px' }}>
        코스맥스 내용물 제조 → 코어 충진 + 고주파 실링 → 연희 납품
      </p>
      
      {/* 출하 희망일 입력 & 발주 구분 표시 */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          padding: '16px 24px', 
          background: isInitialOrder ? 'rgba(244, 164, 96, 0.15)' : 'rgba(100, 200, 150, 0.15)', 
          borderRadius: '12px',
          border: `1px solid ${isInitialOrder ? 'rgba(244, 164, 96, 0.3)' : 'rgba(100, 200, 150, 0.3)'}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: isInitialOrder ? '#f4a460' : '#64c896', marginBottom: '4px' }}>
            {isInitialOrder ? '🏭 초도 발주' : '🔄 재발주'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: isInitialOrder ? '#f4a460' : '#64c896' }}>
            {isInitialOrder ? '6~7주' : '~4주'}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {isInitialOrder ? '금형 제작 포함' : '단가만 적용'}
          </div>
        </div>
        
        {/* 벌크 발주량 입력 (최소 60kg, 이후 10kg 단위) */}
        <div style={{ 
          padding: '16px 24px', 
          background: 'rgba(212, 175, 55, 0.15)', 
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '8px' }}>🧪 벌크 발주량 (코스맥스)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => adjustBulk(-10)}
              disabled={bulkOrderKg <= 60}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: bulkOrderKg <= 60 ? 'rgba(255,255,255,0.1)' : 'rgba(212, 175, 55, 0.3)',
                color: bulkOrderKg <= 60 ? 'rgba(255,255,255,0.3)' : '#d4af37',
                fontSize: '18px',
                fontWeight: '600',
                cursor: bulkOrderKg <= 60 ? 'not-allowed' : 'pointer'
              }}
            >
              −
            </button>
            <div style={{ 
              padding: '8px 16px', 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '8px',
              minWidth: '100px'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#d4af37' }}>{bulkOrderKg}kg</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                최소 60kg + {bulkOrderKg - 60}kg
              </div>
            </div>
            <button
              onClick={() => adjustBulk(10)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(212, 175, 55, 0.3)',
                color: '#d4af37',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            실사용: ~{Math.round(bulkOrderKg * 0.92)}kg (잔량 ~8%)
          </div>
        </div>
        
        <div style={{ 
          padding: '16px 24px', 
          background: 'rgba(212, 175, 55, 0.1)', 
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}>
          <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '8px' }}>📅 출하 희망일</div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '16px',
              fontWeight: '500',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              color: '#d4af37',
              cursor: 'pointer'
            }}
          />
          {dates && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              자재 입고 마감: <span style={{ color: '#f4a460' }}>{formatFullDate(dates.materialDeadline)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 발주 일정 타임라인 */}
      {dates && (
        <div style={{ 
          marginBottom: '24px',
          padding: '20px',
          background: 'rgba(212, 175, 55, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37', marginBottom: '16px', textAlign: 'center' }}>
            📋 업체별 발주 마감일 (출하일: {formatFullDate(dates.target)})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { name: '코스맥스', key: 'cosmax', color: '#d4af37', desc: '벌크 제조' },
              { name: '영천 씰앤팩', key: 'yeongcheon', color: '#6496c8', desc: '실링지' },
              { name: '연희', key: 'yeonhee', color: '#c89664', desc: '1차용기/납품' },
              { name: '덕수산업', key: 'duksu', color: '#64c896', desc: '단상자(옵션)' },
            ].map(supplier => {
              const deadline = dates[supplier.key];
              const daysLeft = getDaysRemaining(deadline);
              const overdue = isOverdue(deadline);
              
              return (
                <div key={supplier.key} style={{ 
                  padding: '16px',
                  background: overdue ? 'rgba(255, 100, 100, 0.1)' : 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  border: `1px solid ${overdue ? 'rgba(255, 100, 100, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{supplier.desc}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: supplier.color, marginBottom: '8px' }}>{supplier.name}</div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: overdue ? '#ff6b6b' : '#fff',
                    marginBottom: '4px'
                  }}>
                    {formatFullDate(deadline)}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: overdue ? '#ff6b6b' : daysLeft <= 7 ? '#f4a460' : '#64c896',
                    fontWeight: '500'
                  }}>
                    {overdue ? `⚠️ ${Math.abs(daysLeft)}일 지남` : 
                     daysLeft === 0 ? '⚠️ 오늘 마감' :
                     `D-${daysLeft}`}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 주요 일정 요약 */}
          <div style={{ 
            marginTop: '16px', 
            padding: '12px 16px', 
            background: 'rgba(244, 164, 96, 0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #f4a460'
          }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
              <strong style={{ color: '#f4a460' }}>⚠️ 병목 공정:</strong>{' '}
              {isInitialOrder ? (
                <span>실링지(영천씰앤팩) 초도 금형 제작 4-5주 소요 → <strong style={{ color: '#6496c8' }}>{formatFullDate(dates.yeongcheon)}</strong>까지 발주 필요</span>
              ) : (
                <span>모든 업체 동시 발주 시 <strong style={{ color: '#64c896' }}>{formatFullDate(dates.yeongcheon)}</strong>까지 발주 권장</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', maxWidth: '950px', margin: '0 auto' }}>
        <svg viewBox="0 0 950 480" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#f4e4bc" stopOpacity="0.8"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#d4af37"/>
            </marker>
          </defs>

          <style>{`
            @keyframes flowMain {
              0% { stroke-dashoffset: 30; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes flowSub {
              0% { stroke-dashoffset: 20; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            .flow-main {
              stroke-dasharray: 15, 15;
              animation: flowMain 1s linear infinite;
            }
            .flow-sub {
              stroke-dasharray: 10, 10;
              animation: flowSub 1.5s linear infinite;
            }
            .pulse-dot {
              animation: pulse 2s ease-in-out infinite;
            }
          `}</style>

          {/* 배경 구역 - 병렬 작업 영역 */}
          <rect x="30" y="50" width="380" height="380" rx="15" fill="rgba(100, 150, 200, 0.03)" stroke="rgba(100, 150, 200, 0.2)" strokeWidth="1" strokeDasharray="5,5"/>
          <text x="220" y="75" textAnchor="middle" fill="rgba(100, 150, 200, 0.6)" fontSize="11" fontWeight="500">⚡ 동시 진행 (병렬)</text>
          
          {/* 충진/실링 & 출하 영역 */}
          <rect x="450" y="50" width="470" height="380" rx="15" fill="rgba(212, 175, 55, 0.03)" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" strokeDasharray="5,5"/>
          <text x="685" y="75" textAnchor="middle" fill="rgba(212, 175, 55, 0.6)" fontSize="11" fontWeight="500">📦 충진/고주파실링/납품</text>

          {/* ===== 내용물 라인 (상단) ===== */}
          <g transform="translate(60, 95)">
            <rect x="0" y="0" width="160" height="100" rx="10" fill="rgba(212, 175, 55, 0.15)" stroke="#d4af37" strokeWidth="2"/>
            <text x="80" y="22" textAnchor="middle" fill="#d4af37" fontSize="13" fontWeight="600">코스맥스 네오</text>
            <text x="80" y="40" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">벌크 제조</text>
            <text x="80" y="58" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📍 화성</text>
            <rect x="30" y="65" width="100" height="20" rx="4" fill="rgba(212, 175, 55, 0.3)"/>
            <text x="80" y="79" textAnchor="middle" fill="#d4af37" fontSize="11" fontWeight="600">{bulkOrderKg}kg 발주</text>
            <text x="80" y="95" textAnchor="middle" fill="#64c896" fontSize="9">2~3주</text>
          </g>
          
          {/* 내용물 → 충진/실링 화살표 */}
          <line x1="220" y1="150" x2="490" y2="230" className="flow-main" stroke="url(#goldGradient)" strokeWidth="3" filter="url(#glow)"/>
          <circle cx="355" cy="190" r="4" fill="#d4af37" className="pulse-dot"/>
          <text x="300" y="170" fill="rgba(212, 175, 55, 0.8)" fontSize="9">벌크 {bulkOrderKg}kg</text>

          {/* ===== 부자재 라인 - 3개 동시 진행 ===== */}
          
          {/* 1. 영천 씰앤팩 - 리드실 */}
          <g transform="translate(60, 210)">
            <rect x="0" y="0" width="160" height="80" rx="10" fill="rgba(100, 150, 200, 0.1)" stroke="rgba(100, 150, 200, 0.5)" strokeWidth="1.5"/>
            <text x="80" y="25" textAnchor="middle" fill="#6496c8" fontSize="12" fontWeight="500">영천 씰앤팩</text>
            <text x="80" y="42" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">리드실</text>
            <text x="80" y="58" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📍 경기도 여주</text>
            <text x="80" y="73" textAnchor="middle" fill={isInitialOrder ? "#f4a460" : "#64c896"} fontSize="8">
              {isInitialOrder ? "초도 4-5주 (병목)" : "재발주 2주"}
            </text>
          </g>
          
          {/* 2. 연희 - 용기/단상자 */}
          <g transform="translate(60, 305)">
            <rect x="0" y="0" width="160" height="80" rx="10" fill="rgba(200, 150, 100, 0.1)" stroke="rgba(200, 150, 100, 0.5)" strokeWidth="1.5"/>
            <text x="80" y="25" textAnchor="middle" fill="#c89664" fontSize="12" fontWeight="500">연희</text>
            <text x="80" y="42" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">1차용기 / 2차단상자 / 패드인쇄</text>
            <text x="80" y="58" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📍 인천</text>
            <text x="80" y="73" textAnchor="middle" fill={isInitialOrder ? "#f4a460" : "#64c896"} fontSize="8">
              {isInitialOrder ? "초도 3-4주" : "재발주 2주"}
            </text>
          </g>
          
          {/* 3. 덕수산업 - 단상자 (옵션) */}
          <g transform="translate(250, 305)">
            <rect x="0" y="0" width="140" height="80" rx="10" fill="rgba(100, 200, 150, 0.1)" stroke="rgba(100, 200, 150, 0.5)" strokeWidth="1.5"/>
            <text x="70" y="25" textAnchor="middle" fill="#64c896" fontSize="12" fontWeight="500">덕수산업</text>
            <text x="70" y="42" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">2차 단상자 (옵션)</text>
            <text x="70" y="58" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📍 서울</text>
            <text x="70" y="73" textAnchor="middle" fill={isInitialOrder ? "#f4a460" : "#64c896"} fontSize="8">
              {isInitialOrder ? "초도 2-3주" : "재발주 1-2주"}
            </text>
          </g>

          {/* 부자재 → 충진/실링 화살표들 */}
          <line x1="220" y1="250" x2="490" y2="260" className="flow-sub" stroke="rgba(100, 150, 200, 0.6)" strokeWidth="2"/>
          <circle cx="355" cy="255" r="3" fill="#6496c8" className="pulse-dot" style={{animationDelay: '0.2s'}}/>

          <line x1="220" y1="345" x2="490" y2="280" className="flow-sub" stroke="rgba(200, 150, 100, 0.6)" strokeWidth="2"/>
          <circle cx="355" cy="312" r="3" fill="#c89664" className="pulse-dot" style={{animationDelay: '0.4s'}}/>

          <line x1="390" y1="345" x2="490" y2="290" className="flow-sub" stroke="rgba(100, 200, 150, 0.6)" strokeWidth="2"/>
          <circle cx="440" cy="317" r="3" fill="#64c896" className="pulse-dot" style={{animationDelay: '0.6s'}}/>

          {/* ===== 충진/실링 (중앙) ===== */}
          <g transform="translate(490, 170)">
            <rect x="0" y="0" width="180" height="140" rx="12" fill="rgba(244, 164, 96, 0.15)" stroke="#f4a460" strokeWidth="2" filter="url(#glow)"/>
            <text x="90" y="30" textAnchor="middle" fill="#f4a460" fontSize="15" fontWeight="600">충진/실링</text>
            <text x="90" y="52" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">코어 충진 · 노캡 고주파 실링</text>
            <text x="90" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">1차용기(연희) + 실링지(영천)</text>
            <line x1="20" y1="88" x2="160" y2="88" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            <text x="90" y="108" textAnchor="middle" fill="#64c896" fontSize="10">리드타임: 1~2주</text>
            <text x="90" y="125" textAnchor="middle" fill="#f4a460" fontSize="9">→ 연희 납품</text>
          </g>

          {/* ===== 연희 납품 (우측) ===== */}
          <g transform="translate(740, 190)">
            <rect x="0" y="0" width="160" height="100" rx="10" fill="rgba(100, 200, 150, 0.15)" stroke="#64c896" strokeWidth="2"/>
            <text x="80" y="28" textAnchor="middle" fill="#64c896" fontSize="13" fontWeight="600">연희 납품</text>
            <text x="80" y="48" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">충진완료품 입고</text>
            <text x="80" y="68" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📍 인천 (연희)</text>
            <rect x="25" y="78" width="110" height="18" rx="9" fill="rgba(212, 175, 55, 0.3)"/>
            <text x="80" y="90" textAnchor="middle" fill="#d4af37" fontSize="9" fontWeight="600">acosmeticstroy</text>
          </g>

          {/* 충진/실링 → 출하(연희 납품) 화살표 */}
          <line x1="670" y1="240" x2="740" y2="240" className="flow-main" stroke="url(#goldGradient)" strokeWidth="3" filter="url(#glow)"/>
          <circle cx="705" cy="240" r="4" fill="#64c896" className="pulse-dot" style={{animationDelay: '0.8s'}}/>
          <text x="705" y="225" fill="rgba(255,255,255,0.5)" fontSize="9">노캡 실링 완료</text>

          {/* ===== 범례 ===== */}
          <g transform="translate(490, 350)">
            <rect x="0" y="0" width="410" height="70" rx="8" fill="rgba(0,0,0,0.3)"/>
            <text x="205" y="18" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="500">📋 핵심 포인트</text>
            <text x="205" y="38" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">• 코스맥스 벌크 → 코어 충진 + 노캡 고주파 실링 → 연희 납품</text>
            <text x="205" y="55" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">
              {isInitialOrder
                ? "• 실링지(영천) 초도 금형 4-5주 기준 일정 수립"
                : "• 재발주 시 모든 업체 2주 내외로 동시 진행 가능"
              }
            </text>
          </g>

        </svg>
      </div>

      {/* 상세 리드타임 테이블 */}
      <div style={{ 
        marginTop: '24px',
        padding: '20px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37', marginBottom: '16px' }}>📅 상세 리드타임 & 발주 마감일</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>공정</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>업체</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: isInitialOrder ? '#f4a460' : '#64c896', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  리드타임
                </th>
                {dates && (
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: '#d4af37', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>발주 마감일</th>
                )}
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {[
                { process: '벌크 제조', company: '코스맥스 네오', initial: '2~3주', reorder: '2~3주', dateKey: 'cosmax', note: `${bulkOrderKg}kg 발주`, color: '#d4af37' },
                { process: '실링지', company: '영천 씰앤팩', initial: '4~5주', reorder: '2주', dateKey: 'yeongcheon', note: isInitialOrder ? '초도 시 금형 제작 (병목)' : '금형 보유', color: '#6496c8' },
                { process: '1차 용기(코어)', company: '연희', initial: '3~4주', reorder: '2주', dateKey: 'yeonhee', note: '용기 사출 + 납품처', color: '#c89664' },
                { process: '2차 단상자', company: '덕수/연희', initial: '2~3주', reorder: '1~2주', dateKey: 'duksu', note: '인쇄 포함', color: '#64c896' },
                { process: '충진/실링', company: '충진서비스', initial: '1~2주', reorder: '1~2주', dateKey: null, note: '코어 충진 + 노캡 고주파 실링 → 연희 납품', color: '#f4a460' },
              ].map((row, idx) => {
                const deadline = dates && row.dateKey ? dates[row.dateKey] : null;
                const overdue = isOverdue(deadline);
                const daysLeft = getDaysRemaining(deadline);
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: '500', color: row.color }}>{row.process}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{row.company}</td>
                    <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center', color: isInitialOrder ? '#f4a460' : '#64c896', fontWeight: '500' }}>
                      {isInitialOrder ? row.initial : row.reorder}
                    </td>
                    {dates && (
                      <td style={{ padding: '12px', fontSize: '12px', textAlign: 'center' }}>
                        {deadline ? (
                          <div>
                            <span style={{ color: overdue ? '#ff6b6b' : '#d4af37', fontWeight: '500' }}>
                              {formatFullDate(deadline)}
                            </span>
                            {daysLeft !== null && (
                              <span style={{ 
                                marginLeft: '8px',
                                fontSize: '10px',
                                color: overdue ? '#ff6b6b' : daysLeft <= 7 ? '#f4a460' : '#64c896'
                              }}>
                                {overdue ? `(${Math.abs(daysLeft)}일 지남)` : `(D-${daysLeft})`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>
                        )}
                      </td>
                    )}
                    <td style={{ padding: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* 총 리드타임 요약 */}
        <div style={{ 
          marginTop: '16px', 
          padding: '16px', 
          background: 'rgba(212, 175, 55, 0.1)', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>총 리드타임 (병렬 진행)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: isInitialOrder ? '#f4a460' : 'rgba(255,255,255,0.4)' }}>초도 발주</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: isInitialOrder ? '#f4a460' : 'rgba(255,255,255,0.3)' }}>6~7주</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: !isInitialOrder ? '#64c896' : 'rgba(255,255,255,0.4)' }}>재발주</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: !isInitialOrder ? '#64c896' : 'rgba(255,255,255,0.3)' }}>~4주</div>
          </div>
          {dates && (
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#d4af37' }}>출하 예정일</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#d4af37' }}>{formatFullDate(dates.target)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MOQDashboard() {
  // === Supabase Auth 인증 ===
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 파생값
  const isAuthenticated = !!session && !!profile;
  const isAdmin = profile?.role === 'admin';
  const displayName = profile?.display_name || user?.email?.split('@')[0] || '';

  // 관리자 상태
  const [adminSnapshots, setAdminSnapshots] = useState([]);
  const [adminAccessLog, setAdminAccessLog] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  // 토스트 메시지
  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef(null);
  const showToast = useCallback((msg, duration = 3000) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), duration);
  }, []);

  // 프로필 조회 헬퍼
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('프로필 조회 실패:', error);
      return null;
    }
    return data;
  }, []);

  // 세션 초기화 + onAuthStateChange 리스너
  useEffect(() => {
    // 현재 세션 복원
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      try {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          const prof = await fetchProfile(currentSession.user.id);
          setProfile(prof);
        }
      } catch (e) {
        console.warn('세션 복원 중 오류:', e);
      } finally {
        setAuthLoading(false);
      }
    }).catch((e) => {
      console.warn('getSession 실패:', e);
      setAuthLoading(false);
    });

    // 실시간 인증 상태 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        try {
          const prof = await fetchProfile(newSession.user.id);
          setProfile(prof);
        } catch (e) {
          console.warn('프로필 로드 실패:', e);
        }
        // 로그인 시 접속 기록 저장
        if (event === 'SIGNED_IN') {
          try {
            await supabase.from('access_log').insert({
              user_id: newSession.user.id,
              email: newSession.user.email,
            });
          } catch (e) {
            console.warn('접속 기록 저장 실패:', e);
          }
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // 로그인 (이메일/비밀번호)
  const handleLogin = async () => {
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    if (error) {
      setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  // 로그아웃
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setAdminSnapshots([]);
    setAdminAccessLog([]);
    setAdminUsers([]);
    setHistorySnapshots([]);
    setSharedSnapshots([]);
  }, []);

  // === 10분 미활동 자동 로그아웃 ===
  const lastActivityRef = useRef(Date.now());
  const logoutWarningShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      logoutWarningShownRef.current = false;
    };

    const events = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, updateActivity));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= AUTO_LOGOUT_MS) {
        handleLogout();
        // 로그아웃 후 다음 렌더에서 토스트 표시 (state 변경 이후)
        setTimeout(() => showToast('10분 미활동으로 자동 로그아웃되었습니다.', 5000), 100);
      } else if (elapsed >= LOGOUT_WARNING_MS && !logoutWarningShownRef.current) {
        logoutWarningShownRef.current = true;
        showToast('1분 후 자동 로그아웃됩니다. 활동을 계속하세요.', 5000);
      }
    }, 60000); // 60초마다 체크

    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity));
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, handleLogout, showToast]);

  // === 히스토리 관리 (Supabase) ===
  const [historySnapshots, setHistorySnapshots] = useState([]); // 내 스냅샷
  const [sharedSnapshots, setSharedSnapshots] = useState([]); // 공유된 스냅샷
  const [historyLabel, setHistoryLabel] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  // 스냅샷 로드 (Supabase)
  const fetchSnapshots = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setHistoryLoading(true);
    try {
      // 내 스냅샷
      const { data: myData, error: myErr } = await supabase
        .from('snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (myErr) throw myErr;

      // 공유된 스냅샷 (다른 사용자)
      const { data: sharedData, error: sharedErr } = await supabase
        .from('snapshots')
        .select('*')
        .eq('is_shared', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (sharedErr) throw sharedErr;

      setHistorySnapshots(myData || []);
      setSharedSnapshots(sharedData || []);
    } catch (e) {
      console.warn('스냅샷 로드 실패:', e);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated, user]);

  // 로그인 완료 시 스냅샷 로드
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSnapshots();
    }
  }, [isAuthenticated, user, fetchSnapshots]);

  // 스냅샷 저장
  const saveHistory = async (label) => {
    const snapshotData = {
      selectedProducts,
      productBulkOrders,
      subMaterials,
      retailPrices,
      pricingMode,
      benchmarkConfig,
      uniformPricePerG,
      aiConfig,
      aiResult,
      additionalCosts,
      customCosts,
    };

    try {
      const { error } = await supabase.from('snapshots').insert({
        user_id: user.id,
        nickname: displayName,
        label: label || `스냅샷 ${historySnapshots.length + 1}`,
        data: snapshotData,
        is_shared: false,
      });
      if (error) throw error;
      showToast('저장되었습니다.');
      fetchSnapshots();
    } catch (e) {
      console.warn('스냅샷 저장 실패:', e);
      showToast('저장 실패');
    }
    setHistoryLabel('');
  };

  // 스냅샷 불러오기
  const loadHistory = (snapshot) => {
    const d = snapshot.data;
    if (d.selectedProducts) setSelectedProducts(d.selectedProducts);
    if (d.productBulkOrders) setProductBulkOrders(d.productBulkOrders);
    if (d.subMaterials) setSubMaterials(d.subMaterials);
    if (d.retailPrices) setRetailPrices(d.retailPrices);
    if (d.pricingMode) setPricingMode(d.pricingMode);
    if (d.benchmarkConfig) setBenchmarkConfig(d.benchmarkConfig);
    if (d.uniformPricePerG !== undefined) setUniformPricePerG(d.uniformPricePerG);
    if (d.aiConfig) setAiConfig(d.aiConfig);
    if (d.aiResult !== undefined) setAiResult(d.aiResult);
    if (d.additionalCosts) setAdditionalCosts(d.additionalCosts);
    if (d.customCosts) setCustomCosts(d.customCosts);
    showToast('스냅샷을 불러왔습니다.');
  };

  // 스냅샷 삭제 (내 것만)
  const deleteHistory = async (id) => {
    try {
      const { error } = await supabase
        .from('snapshots')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      showToast('삭제되었습니다.');
      fetchSnapshots();
    } catch (e) {
      console.warn('스냅샷 삭제 실패:', e);
      showToast('삭제 실패');
    }
  };

  // 공유 토글 (내 스냅샷만)
  const toggleShare = async (id, currentShared) => {
    try {
      const { error } = await supabase
        .from('snapshots')
        .update({ is_shared: !currentShared })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      showToast(!currentShared ? '공유가 활성화되었습니다.' : '공유가 해제되었습니다.');
      fetchSnapshots();
    } catch (e) {
      console.warn('공유 토글 실패:', e);
      showToast('공유 설정 실패');
    }
  };

  // === 관리자 전용 함수 ===
  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [snapRes, logRes, usersRes] = await Promise.all([
        supabase.from('snapshots').select('*').order('created_at', { ascending: false }),
        supabase.from('access_log').select('*').order('logged_in_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      ]);
      if (snapRes.error) throw snapRes.error;
      if (logRes.error) throw logRes.error;
      if (usersRes.error) throw usersRes.error;
      setAdminSnapshots(snapRes.data || []);
      setAdminAccessLog(logRes.data || []);
      setAdminUsers(usersRes.data || []);
    } catch (e) {
      console.warn('관리자 데이터 로드 실패:', e);
      showToast('관리자 데이터 로드 실패');
    }
  }, [isAdmin, showToast]);

  const adminDeleteSnapshot = async (id) => {
    try {
      const { error } = await supabase.from('snapshots').delete().eq('id', id);
      if (error) throw error;
      showToast('스냅샷이 삭제되었습니다.');
      fetchAdminData();
      fetchSnapshots();
    } catch (e) {
      console.warn('관리자 스냅샷 삭제 실패:', e);
      showToast('삭제 실패');
    }
  };

  // 사용자 역할 변경 (관리자 전용)
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      showToast(`역할이 ${newRole === 'admin' ? '관리자' : '일반 사용자'}(으)로 변경되었습니다.`);
      fetchAdminData();
    } catch (e) {
      console.warn('역할 변경 실패:', e);
      showToast('역할 변경 실패');
    }
  };

  // 기존 상태들
  const [selectedProducts, setSelectedProducts] = useState({});
  const [productBulkOrders, setProductBulkOrders] = useState({}); // 제품별 벌크 발주량 (kg)
  const [retailPrices, setRetailPrices] = useState({}); // 소비자가 설정 (SKU별)
  const [subMaterials, setSubMaterials] = useState({
    isInitialOrder: true, // 초도/재발주 구분
    leadSeal: { 
      price: 62, 
      supplier: '영천 씰앤팩',
      // 초도 금형비
      initialMoldCost: 3500000, // 본금형비 (다이셋트)
      initialDieCost: 1000000,  // 본목형비 (톰슨)
      initialPlateCost: 200000, // 인쇄판비
    },
    secondaryBox: { 
      supplier: 'duksu',
      duksuPrice: 156,
      yeonhee7g: 0,
      yeonhee15g: 0,
      yeonhee30g: 0,
      // 초도 금형비
      initialMoldCost: 0,
    },
    container: {
      yeonhee7g: 0,
      yeonhee15g: 0,
      yeonhee30g: 0,
      excluded: false, // 비용에서 제외
      // 초도 금형비
      initialMoldCost: 0,
    },
    padPrint: {
      colors: 1,
      pricePerColor: 0,
      excluded: false, // 비용에서 제외
      // 초도 금형비 (동판비 등)
      initialPlateCost: 0,
    },
    fillingService: {
      // 텐져블스토리 Nego 견적 기준 (충전가공비 + 인/아웃박스만 적용)
      // 수량 티어에 따라 자동 적용, 수동 오버라이드 가능
      autoTier: true,      // true면 수량 기반 자동 티어 적용
      fillingFee: 350,     // 충전가공비 (기본값: 3,000개 기준 350원)
      inOutBox: 20,        // 인/아웃박스 (20원)
    }
  });
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedResultIdx, setExpandedResultIdx] = useState(null);
  const [profitSubTab, setProfitSubTab] = useState('main'); // 'main', 'pricing', 'additionalCosts', 'bulk', 'benchmark'
  const [additionalCosts, setAdditionalCosts] = useState([
    { id: 'pg', name: 'PG 수수료', rate: 3.5, enabled: true },
    { id: 'payment', name: '결제 수수료', rate: 0, enabled: false },
    { id: 'labor', name: '인건비', rate: 0, enabled: false },
    { id: 'ad', name: '광고비', rate: 0, enabled: false },
    { id: 'shipping', name: '배송비', rate: 0, enabled: false },
    { id: 'packaging', name: '포장비', rate: 0, enabled: false },
  ]);
  const [customCosts, setCustomCosts] = useState([]); // {id, name, rate}
  const [showMarginHelp, setShowMarginHelp] = useState(false);
  const [profitCapFilter, setProfitCapFilter] = useState('all'); // 'all', '7', '15', '30'
  const [bulkApplyMsg, setBulkApplyMsg] = useState('');
  
  // 소비자가 설정 모드
  const [pricingMode, setPricingMode] = useState('benchmark'); // 'benchmark', 'uniform', 'manual'
  const [benchmarkConfig, setBenchmarkConfig] = useState({
    referenceProductNo: 1,  // 기준 제품 번호
    retailPricePerG: 0,     // 기준 제품의 소비자가 (₩/g)
  });
  const [uniformPricePerG, setUniformPricePerG] = useState(0); // 균일 소비자가 (₩/g)

  // AI Recommendation states
  const [aiConfig, setAiConfig] = useState({
    targetBudget: 100000000,
    capacityMode: 'ratio', // 'ratio' (비율 기준) | 'minQty' (최소 수량 기준)
    minQty7g: 0,
    minQty15g: 0,
    minQty30g: 0,
    ratioText: '1:1:1', // 비율 직접 입력 (예: 1:1:1, 2:1:1, 1:2:3)
    selectedProductNos: [], // 선택된 제품 번호들
    priorityMode: 'balanced' // 'cost', 'quantity', 'balanced'
  });
  const [aiResult, setAiResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // USD 환율 상태
  const [exchangeRate, setExchangeRate] = useState(1350); // KRW per 1 USD
  const [exchangeRateTime, setExchangeRateTime] = useState('');
  const [exchangeRateLoading, setExchangeRateLoading] = useState(true);

  const fetchExchangeRate = async () => {
    try {
      setExchangeRateLoading(true);
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates && data.rates.KRW) {
        setExchangeRate(data.rates.KRW);
        setExchangeRateTime(data.time_last_update_utc || '');
      }
    } catch (e) {
      console.warn('환율 fetch 실패, 기본값 1350 사용:', e);
      setExchangeRate(1350);
      setExchangeRateTime('');
    } finally {
      setExchangeRateLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const formatUSD = (krw) => `$${(krw / exchangeRate).toFixed(2)}`;

  const MOQ_KG = 60;
  const USABLE_KG = 60; // 60kg 벌크 전량 사용
  // 모든 용량 최소중량 +0.5g 충진: 7→7.5g, 15→15.5g, 30→30.5g

  const handleQuantityChange = (productNo, capacity, quantity) => {
    const key = `${productNo}-${capacity}`;
    setSelectedProducts(prev => ({
      ...prev,
      [key]: {
        productNo,
        capacity,
        quantity: Math.max(0, parseInt(quantity) || 0)
      }
    }));
  };

  const getQuantity = (productNo, capacity) => {
    const key = `${productNo}-${capacity}`;
    return selectedProducts[key]?.quantity || 0;
  };

  const fillingTotalPerUnit = useMemo(() => {
    return subMaterials.fillingService.fillingFee + subMaterials.fillingService.inOutBox;
  }, [subMaterials.fillingService]);

  const totalAdditionalRate = useMemo(() => {
    const predefined = additionalCosts.filter(c => c.enabled).reduce((sum, c) => sum + c.rate, 0);
    const custom = customCosts.reduce((sum, c) => sum + c.rate, 0);
    return predefined + custom;
  }, [additionalCosts, customCosts]);

  // Calculate unit cost for each capacity
  const getUnitCost = (product, capacity) => {
    // 초도/재발주에 따른 벌크 단가 적용
    const bulkCostPerKg = subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder;
    // 모든 용량 +0.5g 충진, 60kg 전량 사용
    const actualCapacity = getActualCapacity(capacity);
    const unitsPerMOQ = Math.floor((USABLE_KG * 1000) / actualCapacity);
    const bulkCostPerUnit = (MOQ_KG * bulkCostPerKg) / unitsPerMOQ;

    const boxSupplier = subMaterials.secondaryBox.supplier;
    let boxPrice = 0;
    if (boxSupplier === 'duksu') {
      boxPrice = subMaterials.secondaryBox.duksuPrice;
    } else {
      boxPrice = capacity === 7 ? subMaterials.secondaryBox.yeonhee7g :
                 capacity === 15 ? subMaterials.secondaryBox.yeonhee15g :
                 subMaterials.secondaryBox.yeonhee30g;
    }

    const containerPrice = subMaterials.container.excluded ? 0 : (
      capacity === 7 ? subMaterials.container.yeonhee7g :
      capacity === 15 ? subMaterials.container.yeonhee15g :
      subMaterials.container.yeonhee30g
    );

    const padPrintCost = subMaterials.padPrint.excluded ? 0 : (subMaterials.padPrint.colors * subMaterials.padPrint.pricePerColor);
    const subMaterialPerUnit = subMaterials.leadSeal.price + boxPrice + containerPrice + padPrintCost;

    return bulkCostPerUnit + subMaterialPerUnit + fillingTotalPerUnit;
  };

  const getUnitCostBreakdown = (product, capacity) => {
    const bulkCostPerKg = subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder;
    const actualCapacity = getActualCapacity(capacity);
    const unitsPerMOQ = Math.floor((USABLE_KG * 1000) / actualCapacity);
    const bulkCostPerUnit = (MOQ_KG * bulkCostPerKg) / unitsPerMOQ;

    const boxSupplier = subMaterials.secondaryBox.supplier;
    let boxPrice = 0;
    if (boxSupplier === 'duksu') {
      boxPrice = subMaterials.secondaryBox.duksuPrice;
    } else {
      boxPrice = capacity === 7 ? subMaterials.secondaryBox.yeonhee7g :
                 capacity === 15 ? subMaterials.secondaryBox.yeonhee15g :
                 subMaterials.secondaryBox.yeonhee30g;
    }

    const containerPrice = subMaterials.container.excluded ? 0 : (
      capacity === 7 ? subMaterials.container.yeonhee7g :
      capacity === 15 ? subMaterials.container.yeonhee15g :
      subMaterials.container.yeonhee30g
    );

    const padPrintCost = subMaterials.padPrint.excluded ? 0 : (subMaterials.padPrint.colors * subMaterials.padPrint.pricePerColor);
    const subMaterialPerUnit = subMaterials.leadSeal.price + boxPrice + containerPrice + padPrintCost;

    return { bulkCostPerUnit, subMaterialPerUnit, fillingPerUnit: fillingTotalPerUnit };
  };

  // 제품 선택 토글
  const toggleProductSelection = (productNo) => {
    setAiConfig(prev => {
      const isSelected = prev.selectedProductNos.includes(productNo);
      return {
        ...prev,
        selectedProductNos: isSelected 
          ? prev.selectedProductNos.filter(no => no !== productNo)
          : [...prev.selectedProductNos, productNo]
      };
    });
  };

  // 전체 선택/해제
  const toggleAllProducts = () => {
    setAiConfig(prev => {
      const allSelected = prev.selectedProductNos.length === productData.length;
      return {
        ...prev,
        selectedProductNos: allSelected ? [] : productData.map(p => p.no)
      };
    });
  };

  // AI Recommendation calculation
  const calculateAIRecommendation = () => {
    if (aiConfig.selectedProductNos.length === 0) {
      alert('제품을 선택해주세요.');
      return;
    }
    
    // 부자재 및 충전비용 입력 체크 (제외된 항목은 검증 안 함)
    const missingCosts = [];
    if (!subMaterials.container.excluded && subMaterials.container.yeonhee7g === 0 && subMaterials.container.yeonhee15g === 0 && subMaterials.container.yeonhee30g === 0) {
      missingCosts.push('1차 용기 (연희)');
    }
    if (subMaterials.secondaryBox.supplier === 'duksu' && subMaterials.secondaryBox.duksuPrice === 0) {
      missingCosts.push('2차 단상자 (덕수)');
    }
    if (subMaterials.fillingService.fillingFee === 0) {
      missingCosts.push('충전가공비');
    }

    if (missingCosts.length > 0) {
      alert(`다음 비용이 입력되지 않았습니다:\n- ${missingCosts.join('\n- ')}\n\n부자재 설정 및 충전/포장 탭에서 비용을 입력해주세요.`);
      return;
    }
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const { targetBudget, minQty7g, minQty15g, minQty30g, ratioText, selectedProductNos, priorityMode, capacityMode } = aiConfig;

      // 선택된 제품들
      const selectedProds = productData.filter(p => selectedProductNos.includes(p.no));

      // 비율 파싱 (예: "1:1:1" → [1,1,1], "2:1:1" → [2,1,1])
      const ratioParts = (ratioText || '1:1:1').split(':').map(s => parseFloat(s.trim()) || 1);
      const r7 = ratioParts[0] || 1;
      const r15 = ratioParts[1] || 1;
      const r30 = ratioParts[2] || 1;
      const totalRatio = r7 + r15 + r30;
      const normalizedRatio = {
        7: r7 / totalRatio,
        15: r15 / totalRatio,
        30: r30 / totalRatio,
      };

      // 100개 단위 버림/올림
      const floorTo100 = (num) => Math.floor(num / 100) * 100;
      const ceilTo100 = (num) => Math.ceil(num / 100) * 100;

      let recommendations = [];
      let totalCost = 0;
      let totalUnits = { 7: 0, 15: 0, 30: 0 };

      selectedProds.forEach(product => {
        const productBulkKg = productBulkOrders[product.no] || 60;
        const usableBulkKg = productBulkKg * (USABLE_KG / MOQ_KG);
        const usableBulkG = usableBulkKg * 1000;

        const tempQtys = {};

        if (capacityMode === 'minQty') {
          // === 최소 수량 기준 모드 ===
          // 1단계: 최소 수량 확보 (100개 올림)
          [7, 15, 30].forEach(cap => {
            const minQty = cap === 7 ? minQty7g : cap === 15 ? minQty15g : minQty30g;
            tempQtys[cap] = ceilTo100(Math.max(minQty, 0));
          });
        } else {
          // === 비율 기준 모드 ===
          // 1단계: 비율대로 계산 후 100개 버림 (초과 방지)
          const weightedSum = [7, 15, 30].reduce((sum, cap) => sum + normalizedRatio[cap] * getActualCapacity(cap), 0);
          const qtyFactor = usableBulkG / weightedSum;
          [7, 15, 30].forEach(cap => {
            tempQtys[cap] = floorTo100(qtyFactor * normalizedRatio[cap]);
          });
        }

        // 2단계: 잔여 벌크를 비율 균형 맞추며 100개씩 채움
        // 비율 대비 가장 부족한 용량에 우선 배분 → 최대한 벌크 소진
        const getBulkUsed = () => [7, 15, 30].reduce((s, c) => s + tempQtys[c] * getActualCapacity(c), 0);
        let safety = 0;
        while (safety++ < 200) {
          const remaining = usableBulkG - getBulkUsed();
          // 100개 추가 가능한 용량 찾기 (가장 작은 용량 = 7.5g * 100 = 750g 필요)
          const candidates = [7, 15, 30].filter(cap => getActualCapacity(cap) * 100 <= remaining);
          if (candidates.length === 0) break;

          // 비율 대비 가장 부족한 용량 선택 (현재 수량 / 목표 비율이 가장 낮은 것)
          const totalQtyNow = tempQtys[7] + tempQtys[15] + tempQtys[30];
          let bestCap = candidates[0];
          let bestDeficit = -Infinity;
          candidates.forEach(cap => {
            // 목표 비율 대비 현재 달성 비율의 차이
            const targetShare = normalizedRatio[cap];
            const currentShare = totalQtyNow > 0 ? tempQtys[cap] / totalQtyNow : 0;
            const deficit = targetShare - currentShare;
            if (deficit > bestDeficit) {
              bestDeficit = deficit;
              bestCap = cap;
            }
          });
          tempQtys[bestCap] += 100;
        }

        // 3단계: 혹시 초과됐으면 보정 (안전장치)
        while (getBulkUsed() > usableBulkG) {
          const capsDesc = [30, 15, 7];
          let reduced = false;
          for (const cap of capsDesc) {
            if (tempQtys[cap] >= 100) {
              tempQtys[cap] -= 100;
              reduced = true;
              break;
            }
          }
          if (!reduced) break;
        }

        // 제품당 총 사용 벌크 & 잔여량
        const totalBulkUsedG = getBulkUsed();
        const productTotalBulkUsedKg = Math.round(totalBulkUsedG / 100) / 10;
        const productRemainingBulkKg = Math.round((usableBulkG - totalBulkUsedG) / 100) / 10;

        [7, 15, 30].forEach(cap => {
          const actualCapacity = getActualCapacity(cap);
          const recommendedQty = tempQtys[cap];
          const unitCost = getUnitCost(product, cap);
          const cost = recommendedQty * unitCost;
          const actualBulkUsed = (recommendedQty * actualCapacity) / 1000;

          recommendations.push({
            product,
            capacity: cap,
            quantity: recommendedQty,
            unitCost,
            totalCost: cost,
            bulkKg: productBulkKg,
            bulkUsedKg: Math.round(actualBulkUsed * 10) / 10,
            moqCount: Math.ceil(productBulkKg / MOQ_KG),
            productTotalBulkUsedKg,
            productRemainingBulkKg,
            usableBulkKg: Math.round(usableBulkKg * 10) / 10,
          });

          totalCost += cost;
          totalUnits[cap] += recommendedQty;
        });
      });
      
      // 예산 초과 시 경고만 표시 (수량은 벌크 기준이므로 조정하지 않음)
      const budgetExceeded = totalCost > targetBudget;
      
      const grandTotalUnits = totalUnits[7] + totalUnits[15] + totalUnits[30];
      
      setAiResult({
        recommendations,
        summary: {
          totalCost,
          totalUnits,
          grandTotalUnits,
          budgetUsage: (totalCost / targetBudget * 100).toFixed(1),
          budgetExceeded,
          avgUnitCost: grandTotalUnits > 0 ? totalCost / grandTotalUnits : 0,
          capacityDistribution: {
            7: grandTotalUnits > 0 ? ((totalUnits[7] / grandTotalUnits) * 100).toFixed(1) : '0',
            15: grandTotalUnits > 0 ? ((totalUnits[15] / grandTotalUnits) * 100).toFixed(1) : '0',
            30: grandTotalUnits > 0 ? ((totalUnits[30] / grandTotalUnits) * 100).toFixed(1) : '0',
          },
          selectedProductCount: selectedProds.length,
          // 제품당 벌크량 합계 (제품별로 한 번씩만 계산)
          totalBulkKg: selectedProds.reduce((sum, p) => sum + (productBulkOrders[p.no] || 60), 0)
        }
      });
      
      setIsCalculating(false);
    }, 800);
  };

  // Apply AI recommendation to selected products
  const applyAIRecommendation = () => {
    if (!aiResult) return;
    
    const newSelectedProducts = {};
    const newProductBulkOrders = {};
    
    aiResult.recommendations.forEach(rec => {
      const key = `${rec.product.no}-${rec.capacity}`;
      newSelectedProducts[key] = {
        productNo: rec.product.no,
        capacity: rec.capacity,
        quantity: rec.quantity
      };
      // 제품별 벌크 발주량 설정
      if (!newProductBulkOrders[rec.product.no]) {
        newProductBulkOrders[rec.product.no] = rec.bulkKg;
      }
    });
    
    setSelectedProducts(newSelectedProducts);
    setProductBulkOrders(newProductBulkOrders);
    setActiveTab('results');
  };

  const calculations = useMemo(() => {
    const results = [];
    let totalBulkCost = 0;
    let totalContainerCost = 0;
    let totalLeadSealCost = 0;
    let totalBoxCost = 0;
    let totalPadPrintCost = 0;
    let totalFillingCost = 0;
    let totalUnits = 0;
    
    // 초도 금형비 합계
    let totalInitialCost = 0;
    if (subMaterials.isInitialOrder) {
      totalInitialCost = 
        (subMaterials.leadSeal.initialMoldCost || 0) +
        (subMaterials.leadSeal.initialDieCost || 0) +
        (subMaterials.leadSeal.initialPlateCost || 0) +
        (subMaterials.secondaryBox.initialMoldCost || 0) +
        (subMaterials.container.initialMoldCost || 0) +
        (subMaterials.padPrint.initialPlateCost || 0);
    }

    // 1단계: 제품별로 그룹화하여 벌크 필요량 합산 (생산수량 100단위 기준)
    const productGroups = {};
    Object.values(selectedProducts).forEach(({ productNo, capacity, quantity }) => {
      if (quantity > 0) {
        if (!productGroups[productNo]) {
          productGroups[productNo] = {
            product: productData.find(p => p.no === productNo),
            capacities: {}
          };
        }
        // 모든 용량 +0.5g 충진
        const actualCapacity = getActualCapacity(capacity);
        // 생산수량: 희망수량 기준으로 100단위 올림
        const productionQty = Math.ceil(quantity / 100) * 100;
        // 벌크 필요량은 생산수량 기준으로 계산
        const bulkNeededKg = (productionQty * actualCapacity) / 1000;
        
        productGroups[productNo].capacities[capacity] = {
          requestedQty: quantity,
          productionQty,
          actualCapacity,
          bulkNeededKg
        };
      }
    });

    // 2단계: 제품별로 벌크 발주량 적용 후 용량별 결과 생성
    Object.entries(productGroups).forEach(([productNo, { product, capacities }]) => {
      if (!product) return;
      
      // 해당 제품의 모든 용량 벌크 필요량 합산 (생산수량 기준)
      const totalBulkNeededKg = Object.values(capacities).reduce((sum, c) => sum + c.bulkNeededKg, 0);
      
      // 사용자가 입력한 벌크 발주량 사용 (없으면 60kg 기본값)
      const userBulkOrderKg = productBulkOrders[productNo] || 60;
      // 60kg 단위로 올림 (MOQ 단위)
      const actualBulkKg = Math.max(MOQ_KG, Math.ceil(userBulkOrderKg / MOQ_KG) * MOQ_KG);
      const moqCount = actualBulkKg / MOQ_KG;
      const usableBulkKg = moqCount * USABLE_KG;
      
      // 벌크 비용 (제품당 한 번)
      const bulkPricePerKg = subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder;
      const productBulkCost = actualBulkKg * bulkPricePerKg;
      
      // 각 용량의 벌크 비용 비율로 분배
      const capacityCount = Object.keys(capacities).length;
      
      // 각 용량별 결과 생성
      Object.entries(capacities).forEach(([cap, data]) => {
        const capacity = parseInt(cap);
        const { requestedQty, productionQty, actualCapacity, bulkNeededKg } = data;
        
        // 벌크 비용을 용량별 비율로 분배
        const bulkRatio = totalBulkNeededKg > 0 ? bulkNeededKg / totalBulkNeededKg : 1 / capacityCount;
        const allocatedBulkCost = productBulkCost * bulkRatio;
        const allocatedBulkKg = actualBulkKg * bulkRatio;
        
        // 1차 용기 (연희) — excluded 시 0원
        const containerPrice = subMaterials.container.excluded ? 0 : (
          capacity === 7 ? subMaterials.container.yeonhee7g :
          capacity === 15 ? subMaterials.container.yeonhee15g :
          subMaterials.container.yeonhee30g
        );
        const containerCost = containerPrice * productionQty;

        // 실링지 (영천 씰앤팩)
        const leadSealPrice = subMaterials.leadSeal.price;
        const leadSealCost = leadSealPrice * productionQty;

        // 2차 단상자 (덕수 or 연희)
        const boxSupplier = subMaterials.secondaryBox.supplier;
        let boxPrice = 0;
        if (boxSupplier === 'duksu') {
          boxPrice = subMaterials.secondaryBox.duksuPrice;
        } else {
          boxPrice = capacity === 7 ? subMaterials.secondaryBox.yeonhee7g :
                     capacity === 15 ? subMaterials.secondaryBox.yeonhee15g :
                     subMaterials.secondaryBox.yeonhee30g;
        }
        const boxCost = boxPrice * productionQty;

        // 패드 인쇄 — excluded 시 0원
        const padPrintPrice = subMaterials.padPrint.excluded ? 0 : (subMaterials.padPrint.colors * subMaterials.padPrint.pricePerColor);
        const padPrintCost = padPrintPrice * productionQty;
        
        // 충전가공비 + 인/아웃박스
        const fillingCostTotal = fillingTotalPerUnit * productionQty;

        // 총 부자재 비용
        const totalSubMaterial = containerCost + leadSealCost + boxCost + padPrintCost;

        // 총 비용
        const totalCost = allocatedBulkCost + totalSubMaterial + fillingCostTotal;

        results.push({
          product,
          capacity,
          requestedQty,
          productionQty,
          bulkNeededKg: Math.round(bulkNeededKg * 10) / 10,
          allocatedBulkKg: Math.round(allocatedBulkKg * 10) / 10,
          actualBulkKg, // 제품 전체 MOQ
          moqCount,
          bulkCost: allocatedBulkCost,
          bulkPricePerKg,
          // 세분화된 부자재 비용
          containerCost,
          containerPrice,
          leadSealCost,
          leadSealPrice,
          boxCost,
          boxPrice,
          padPrintCost,
          padPrintPrice,
          totalSubMaterial,
          // 충전가공비 + 인/아웃박스
          fillingCostTotal,
          fillingPrice: fillingTotalPerUnit,
          // 총 비용 (초도 금형비 제외, 나중에 합산)
          totalCost,
          unitCost: productionQty > 0 ? totalCost / productionQty : 0
        });

        totalBulkCost += allocatedBulkCost;
        totalContainerCost += containerCost;
        totalLeadSealCost += leadSealCost;
        totalBoxCost += boxCost;
        totalPadPrintCost += padPrintCost;
        totalFillingCost += fillingCostTotal;
        totalUnits += productionQty;
      });
    });

    // 초도 금형비를 총 수량으로 나눠서 개당 추가 단가 계산
    const initialCostPerUnit = totalUnits > 0 ? totalInitialCost / totalUnits : 0;
    
    // 각 결과에 초도 금형비 반영된 단가 추가
    const resultsWithInitial = results.map(r => ({
      ...r,
      initialCostShare: r.productionQty * initialCostPerUnit, // 해당 SKU의 초도 금형비 분담금
      totalCostWithInitial: r.totalCost + (r.productionQty * initialCostPerUnit),
      unitCostWithInitial: r.unitCost + initialCostPerUnit
    }));

    return {
      results: resultsWithInitial,
      totalBulkCost,
      totalContainerCost,
      totalLeadSealCost,
      totalBoxCost,
      totalPadPrintCost,
      totalSubMaterialCost: totalContainerCost + totalLeadSealCost + totalBoxCost + totalPadPrintCost,
      totalFillingCost,
      totalInitialCost,
      initialCostPerUnit,
      totalUnits,
      grandTotal: totalBulkCost + totalContainerCost + totalLeadSealCost + totalBoxCost + totalPadPrintCost + totalFillingCost + totalInitialCost,
      isInitialOrder: subMaterials.isInitialOrder
    };
  }, [selectedProducts, subMaterials, fillingTotalPerUnit, productBulkOrders]);

  // 내용물 비용 통계 계산
  const contentStats = useMemo(() => {
    const bulkCosts = productData.map(p => subMaterials.isInitialOrder ? p.totalInitial : p.totalReorder);
    const contentCosts = productData.map(p => p.contentPrice);
    const sorted = [...bulkCosts].sort((a, b) => a - b);
    const contentSorted = [...contentCosts].sort((a, b) => a - b);

    const median = (arr) => {
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    };

    return {
      bulk: {
        avg: Math.round(bulkCosts.reduce((s, v) => s + v, 0) / bulkCosts.length),
        median: Math.round(median(sorted)),
        max: Math.max(...bulkCosts),
        min: Math.min(...bulkCosts),
        maxProduct: productData[bulkCosts.indexOf(Math.max(...bulkCosts))],
        minProduct: productData[bulkCosts.indexOf(Math.min(...bulkCosts))],
      },
      content: {
        avg: Math.round(contentCosts.reduce((s, v) => s + v, 0) / contentCosts.length),
        median: Math.round(median(contentSorted)),
        max: Math.max(...contentCosts),
        min: Math.min(...contentCosts),
        maxProduct: productData[contentCosts.indexOf(Math.max(...contentCosts))],
        minProduct: productData[contentCosts.indexOf(Math.min(...contentCosts))],
      },
    };
  }, [subMaterials.isInitialOrder]);

  // 벤치마크 기준 소비자가 자동 계산
  const computedRetailPrices = useMemo(() => {
    if (pricingMode === 'manual') return retailPrices;

    const newPrices = {};
    const refProduct = productData.find(p => p.no === benchmarkConfig.referenceProductNo);
    const refBulkCost = refProduct
      ? (subMaterials.isInitialOrder ? refProduct.totalInitial : refProduct.totalReorder)
      : 0;

    if (pricingMode === 'benchmark' && benchmarkConfig.retailPricePerG > 0 && refBulkCost > 0) {
      // 기준 제품: 벌크단가/1000 = g당 원가 → retailPricePerG / (refBulkCost/1000) = 배수
      const markupRatio = benchmarkConfig.retailPricePerG / (refBulkCost / 1000);

      productData.forEach(product => {
        const bulkCost = subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder;
        const productRetailPerG = (bulkCost / 1000) * markupRatio;
        [7, 15, 30].forEach(cap => {
          const key = `${product.no}-${cap}`;
          newPrices[key] = Math.round(productRetailPerG * cap / 10) * 10;
        });
      });
    } else if (pricingMode === 'uniform' && uniformPricePerG > 0) {
      productData.forEach(product => {
        [7, 15, 30].forEach(cap => {
          const key = `${product.no}-${cap}`;
          newPrices[key] = Math.round(uniformPricePerG * cap / 10) * 10;
        });
      });
    }

    return newPrices;
  }, [pricingMode, benchmarkConfig, uniformPricePerG, retailPrices, subMaterials.isInitialOrder]);

  const filteredProducts = productData.filter(p =>
    p.korName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.engName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.labNum.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(Math.ceil(num));

  // CSV 내보내기
  const exportCSV = () => {
    if (calculations.results.length === 0) return;
    const BOM = '\uFEFF';
    const headers = ['제품명', '영문명', '용량(g)', '희망수량', '생산수량', '벌크(Kg)', '벌크비용(원)', '1차용기(원)', '실링지(원)', '2차단상자(원)', '패드인쇄(원)', '충전가공비(원)', calculations.isInitialOrder ? '금형비분담(원)' : '', '총비용(원)', '개당원가(원)', '벌크비율(%)', '1차용기비율(%)', '실링지비율(%)', '2차단상자비율(%)', '충전가공비비율(%)', ...(calculations.isInitialOrder ? ['금형비비율(%)'] : [])].filter(Boolean);
    const rows = calculations.results.map(r => {
      const costSum = r.bulkCost + r.containerCost + r.leadSealCost + r.boxCost + r.fillingCostTotal + (calculations.isInitialOrder ? r.initialCostShare : 0);
      const pct = (v) => costSum > 0 ? (v / costSum * 100).toFixed(1) : '0';
      return [
        r.product.korName,
        r.product.engName,
        r.capacity,
        r.requestedQty,
        r.productionQty,
        r.bulkNeededKg,
        Math.ceil(r.bulkCost),
        Math.ceil(r.containerCost),
        Math.ceil(r.leadSealCost),
        Math.ceil(r.boxCost),
        Math.ceil(r.padPrintCost),
        Math.ceil(r.fillingCostTotal),
        ...(calculations.isInitialOrder ? [Math.ceil(r.initialCostShare)] : []),
        Math.ceil(r.totalCostWithInitial),
        Math.ceil(r.unitCostWithInitial),
        pct(r.bulkCost),
        pct(r.containerCost),
        pct(r.leadSealCost),
        pct(r.boxCost),
        pct(r.fillingCostTotal),
        ...(calculations.isInitialOrder ? [pct(r.initialCostShare)] : []),
      ];
    });
    // 요약 행
    rows.push([]);
    rows.push(['[비용 요약]']);
    rows.push(['총 생산 수량', '', '', '', calculations.totalUnits]);
    rows.push(['벌크 (코스맥스)', '', '', '', '', '', Math.ceil(calculations.totalBulkCost)]);
    rows.push(['부자재 합계', '', '', '', '', '', '', Math.ceil(calculations.totalContainerCost), Math.ceil(calculations.totalLeadSealCost), Math.ceil(calculations.totalBoxCost), Math.ceil(calculations.totalPadPrintCost)]);
    rows.push(['충전가공비+인/아웃박스', '', '', '', '', '', '', '', '', '', '', Math.ceil(calculations.totalFillingCost)]);
    if (calculations.isInitialOrder) {
      rows.push(['초도 금형비(원)', '', '', '', '', '', '', '', '', '', '', '', Math.ceil(calculations.totalInitialCost)]);
    }
    rows.push(['총 비용(원)', '', '', '', '', '', '', '', '', '', '', '', '', Math.ceil(calculations.grandTotal)]);

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `INTRINSIC_원가산출_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF 인쇄 (모든 아코디언 펼쳐서 인쇄)
  const [printAllExpanded, setPrintAllExpanded] = useState(false);
  const handlePrint = () => {
    setPrintAllExpanded(true);
    setTimeout(() => {
      window.print();
      setPrintAllExpanded(false);
    }, 300);
  };

  // 로딩 화면
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '28px', fontWeight: '300',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '2px', marginBottom: '16px',
          }}>
            INTRINSIC LINE
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  // 로그인 화면 (이메일 + 비밀번호)
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {/* 토스트 */}
        {toastMsg && (
          <div style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', background: 'rgba(212, 175, 55, 0.95)', color: '#1a1a2e',
            borderRadius: '8px', fontSize: '13px', fontWeight: '600', zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>{toastMsg}</div>
        )}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '48px 40px',
          width: '380px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: 'rgba(212, 175, 55, 0.7)', marginBottom: '8px', textTransform: 'uppercase' }}>
            acosmeticstroy
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '300',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
            margin: '0 0 8px 0',
          }}>
            INTRINSIC LINE
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginBottom: '32px' }}>
            원가 산출 대시보드
          </p>

          <input
            type="email"
            placeholder="이메일"
            value={loginEmail}
            onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('login-pw')?.focus()}
            style={{
              width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${loginError ? 'rgba(255, 107, 107, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px', color: '#e8e6e3', fontSize: '14px', outline: 'none', marginBottom: '12px',
            }}
          />
          <input
            id="login-pw"
            type="password"
            placeholder="비밀번호"
            value={loginPassword}
            onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${loginError ? 'rgba(255, 107, 107, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px', color: '#e8e6e3', fontSize: '14px', outline: 'none', marginBottom: '12px',
            }}
          />
          {loginError && (
            <div style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '12px' }}>{loginError}</div>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: '100%', padding: '12px',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)',
              border: 'none', borderRadius: '8px', color: '#1a1a2e',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
      color: '#e8e6e3',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '24px',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] { -moz-appearance: textfield; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        
        .glow-accent {
          box-shadow: 0 0 40px rgba(212, 175, 55, 0.15);
        }
        
        .input-field {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e8e6e3;
          padding: 10px 14px;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .input-field:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
        }
        
        .qty-input {
          width: 70px;
          text-align: center;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #d4af37;
          padding: 6px 8px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .qty-input:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.6);
        }
        
        .tab-btn {
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .tab-btn.active {
          color: #d4af37;
        }
        
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d4af37, transparent);
        }
        
        .product-row {
          transition: all 0.2s ease;
        }
        
        .product-row:hover {
          background: rgba(212, 175, 55, 0.05);
        }

        .summary-card-hover:hover .summary-tooltip {
          display: block !important;
        }

        .capacity-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }
        
        .select-field {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e8e6e3;
          padding: 10px 14px;
          font-size: 14px;
          cursor: pointer;
          width: 100%;
        }
        
        .select-field:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.5);
        }
        
        .ai-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 10px;
          color: white;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .ai-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .ai-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .apply-btn {
          background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
          border: none;
          border-radius: 10px;
          color: #1a1a2e;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
        }
        
        .ratio-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }
        
        .ratio-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* PDF 인쇄 전용 스타일 */
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body, html {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print, .tab-btn, footer {
            display: none !important;
          }
          .glass-card {
            background: white !important;
            border: 1px solid #ccc !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }
          .glow-accent {
            box-shadow: none !important;
          }
          table {
            border-collapse: collapse !important;
            border: 1px solid #333 !important;
          }
          table th, table td {
            border: 1px solid #333 !important;
            color: black !important;
            padding: 4px 6px !important;
          }
          table th {
            background: #e8e8e8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table tr {
            border-bottom: 1px solid #333 !important;
          }
          .print-header {
            display: block !important;
          }
          *:not(.print-bar-segment):not(.print-color-dot) {
            color: black !important;
            background: white !important;
            -webkit-text-fill-color: black !important;
          }
          .capacity-badge {
            border: 1px solid #999 !important;
          }
          /* 스크롤 영역 전체 펼침 */
          .scrollbar-thin {
            max-height: none !important;
            overflow: visible !important;
          }
          /* 아코디언 펼침 상태 인쇄 */
          .print-expand {
            display: table-row !important;
          }
          /* 원가 차트 바 세그먼트 & 색상 점 - 색상 보존 */
          .print-bar-segment {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: #1a1a2e !important;
            -webkit-text-fill-color: #1a1a2e !important;
          }
          .print-color-dot {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* SVG 프로세스 차트 보존 */
          svg, svg * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* 토스트 메시지 */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', background: 'rgba(212, 175, 55, 0.95)', color: '#1a1a2e',
          borderRadius: '8px', fontSize: '13px', fontWeight: '600', zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'opacity 0.3s',
        }}>{toastMsg}</div>
      )}

      {/* 사용자 정보 바 */}
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px',
        marginBottom: '8px', fontSize: '12px',
      }}>
        <span style={{ color: '#d4af37' }}>
          접속자: {displayName}
          {isAdmin && (
            <span style={{
              marginLeft: '6px', padding: '1px 6px', fontSize: '10px',
              background: 'rgba(255, 107, 107, 0.2)', border: '1px solid rgba(255, 107, 107, 0.4)',
              borderRadius: '4px', color: '#ff6b6b', fontWeight: '600',
            }}>[관리자]</span>
          )}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '4px 12px', background: 'rgba(255, 107, 107, 0.15)',
            border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: '6px',
            color: '#ff6b6b', fontSize: '11px', cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ 
          fontSize: '11px', 
          letterSpacing: '4px', 
          color: 'rgba(212, 175, 55, 0.7)',
          marginBottom: '8px',
          textTransform: 'uppercase'
        }}>
          acosmeticstroy
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '300',
          background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px',
          margin: 0
        }}>
          INTRINSIC LINE
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.4)', 
          fontSize: '13px',
          marginTop: '8px'
        }}>
          CORE 화장품 · MOQ · 제품 · 용량 수량 산출 대시보드
        </p>
      </div>

      {/* Summary Cards */}
      <div className="no-print" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: '총 SKU', value: '90종', sub: '30종 × 3용량' },
          { label: '최소 벌크 발주', value: '60Kg', sub: '60Kg 전량 사용' },
          { label: '발주 구분', value: subMaterials.isInitialOrder ? '초도' : '재발주', sub: subMaterials.isInitialOrder ? '금형비 포함' : '단가만 적용', isInitial: subMaterials.isInitialOrder },
          { label: '선택된 제품', value: `${calculations.results.length}종`, sub: '현재 선택' },
          { label: '총 생산 수량', value: `${formatNumber(calculations.totalUnits)}개`, sub: '예상 수량' },
          { label: '예상 총 비용', value: `₩${formatNumber(calculations.grandTotal)}`, usd: formatUSD(calculations.grandTotal), sub: subMaterials.isInitialOrder ? '금형비 포함' : '단가만', highlight: true },
        ].map((card, idx) => (
          <div key={idx} className={`glass-card ${card.highlight ? 'glow-accent' : ''}`} style={{
            padding: '20px',
            background: card.isInitial !== undefined
              ? (card.isInitial ? 'rgba(244, 164, 96, 0.1)' : 'rgba(100, 200, 150, 0.1)')
              : undefined,
            border: card.isInitial !== undefined
              ? `1px solid ${card.isInitial ? 'rgba(244, 164, 96, 0.3)' : 'rgba(100, 200, 150, 0.3)'}`
              : undefined
          }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>
              {card.label}
            </div>
            <div style={{
              fontSize: card.highlight ? '20px' : '24px',
              fontWeight: '300',
              color: card.highlight ? '#d4af37' : card.isInitial !== undefined ? (card.isInitial ? '#f4a460' : '#64c896') : '#fff',
              marginBottom: '4px'
            }}>
              {card.value}
            </div>
            {card.usd && <div style={{ fontSize: '12px', color: 'rgba(100,200,150,0.7)', marginBottom: '2px' }}>{card.usd}</div>}
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 환율 기준 마킹 */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        padding: '6px 12px',
        background: 'rgba(100, 200, 150, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(100, 200, 150, 0.1)'
      }}>
        {exchangeRateLoading ? '환율 로딩 중...' : (
          <>💱 환율: ₩{formatNumber(exchangeRate)}/$ {exchangeRateTime ? `(${exchangeRateTime.replace(/ \+0000$/, ' UTC')} 기준)` : '(기본값)'}</>
        )}
        <button
          onClick={fetchExchangeRate}
          disabled={exchangeRateLoading}
          style={{
            padding: '2px 8px',
            background: 'rgba(100, 200, 150, 0.15)',
            border: '1px solid rgba(100, 200, 150, 0.25)',
            borderRadius: '4px',
            color: '#64c896',
            fontSize: '10px',
            cursor: exchangeRateLoading ? 'not-allowed' : 'pointer',
            opacity: exchangeRateLoading ? 0.5 : 1,
          }}
        >
          {exchangeRateLoading ? '...' : '🔄 새로고침'}
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className="no-print" style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 16px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'products', label: '제품 선택' },
            { id: 'materials', label: '부자재 설정' },
            { id: 'filling', label: '충전/포장 (견적)' },
            { id: 'ai', label: '🤖 AI 추천 계산' },
            { id: 'logistics', label: '물류 흐름도' },
            { id: 'results', label: '산출 결과' },
            { id: 'profit', label: '💰 수익 분석' },
            { id: 'history', label: '📂 저장/불러오기' },
            ...(isAdmin ? [{ id: 'admin', label: '🔒 관리자' }] : []),
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {/* AI Recommendation Tab */}
          {activeTab === 'ai' && (
            <div style={{ maxWidth: '1200px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Left: Basic Settings */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#d4af37',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ⚙️ 기본 설정
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>
                      목표 총 금액
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={aiConfig.targetBudget}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, targetBudget: parseInt(e.target.value) || 0 }))}
                      style={{ fontSize: '18px', fontWeight: '600' }}
                    />
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                      ₩{formatNumber(aiConfig.targetBudget)}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>
                      최적화 모드
                    </label>
                    <select
                      className="select-field"
                      value={aiConfig.priorityMode}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, priorityMode: e.target.value }))}
                    >
                      <option value="balanced">균형 (비용 & 수량)</option>
                      <option value="cost">비용 최소화</option>
                      <option value="quantity">수량 최대화</option>
                    </select>
                  </div>
                  
                  {/* 계산 기준 안내 */}
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(100, 200, 150, 0.1)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #64c896',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    <div style={{ fontWeight: '600', color: '#64c896', marginBottom: '6px' }}>📋 계산 기준</div>
                    <div>• 벌크 60kg 전량 사용</div>
                    <div>• 모든 용량: 최소중량 +0.5g 충진 (7→7.5g, 15→15.5g, 30→30.5g)</div>
                    <div>• 선택된 모든 제품에 동일 비율 적용</div>
                  </div>
                </div>
                
                {/* Middle: Product Selection */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: 0
                    }}>
                      📦 제품 선택
                    </h3>
                    <button
                      onClick={toggleAllProducts}
                      style={{
                        padding: '8px 16px',
                        background: aiConfig.selectedProductNos.length === productData.length 
                          ? 'rgba(244, 164, 96, 0.2)' 
                          : 'rgba(100, 200, 150, 0.2)',
                        border: `1px solid ${aiConfig.selectedProductNos.length === productData.length ? '#f4a460' : '#64c896'}`,
                        borderRadius: '6px',
                        color: aiConfig.selectedProductNos.length === productData.length ? '#f4a460' : '#64c896',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {aiConfig.selectedProductNos.length === productData.length ? '전체 해제' : '전체 선택'}
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'rgba(255,255,255,0.5)', 
                    marginBottom: '12px' 
                  }}>
                    선택된 제품: <span style={{ color: '#d4af37', fontWeight: '600' }}>{aiConfig.selectedProductNos.length}</span> / 30종
                  </div>
                  
                  <div className="scrollbar-thin" style={{ 
                    maxHeight: '280px', 
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    {productData.map(product => {
                      const isSelected = aiConfig.selectedProductNos.includes(product.no);
                      return (
                        <div
                          key={product.no}
                          onClick={() => toggleProductSelection(product.no)}
                          style={{
                            padding: '10px 12px',
                            background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.2)',
                            border: `1px solid ${isSelected ? 'rgba(212, 175, 55, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${isSelected ? '#d4af37' : 'rgba(255,255,255,0.3)'}`,
                            background: isSelected ? '#d4af37' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isSelected && (
                              <span style={{ color: '#1a1a2e', fontSize: '12px', fontWeight: '700' }}>✓</span>
                            )}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ 
                              fontSize: '12px', 
                              fontWeight: '500',
                              color: isSelected ? '#d4af37' : 'rgba(255,255,255,0.8)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {product.korName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Right: Capacity Settings */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#d4af37',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📊 용량별 설정
                  </h3>

                  {/* 모드 선택 */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {[
                      { id: 'ratio', label: '비율 기준', desc: '7g:15g:30g 비율로 수량 배분' },
                      { id: 'minQty', label: '최소 수량 기준', desc: '용량별 최소 수량 확보 후 잔여 배분' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setAiConfig(prev => ({ ...prev, capacityMode: mode.id }))}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          border: aiConfig.capacityMode === mode.id ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                          background: aiConfig.capacityMode === mode.id ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '600', color: aiConfig.capacityMode === mode.id ? '#d4af37' : 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                          {mode.label}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{mode.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* 비율 입력 (공통) */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>
                      7g : 15g : 30g 수량 비율
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="1:1:1"
                        value={aiConfig.ratioText}
                        onChange={(e) => setAiConfig(prev => ({ ...prev, ratioText: e.target.value }))}
                        style={{ fontSize: '20px', fontWeight: '600', textAlign: 'center', letterSpacing: '2px', maxWidth: '200px' }}
                      />
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>
                        <div>예: <span style={{ color: '#d4af37' }}>1:1:1</span> = 동일 수량</div>
                        <div>예: <span style={{ color: '#d4af37' }}>2:1:1</span> = 7g 2배</div>
                        <div>예: <span style={{ color: '#d4af37' }}>1:2:3</span> = 30g 3배</div>
                      </div>
                    </div>
                    {/* 비율 시각화 바 */}
                    {(() => {
                      const parts = (aiConfig.ratioText || '1:1:1').split(':').map(s => parseFloat(s.trim()) || 1);
                      const t = (parts[0]||1) + (parts[1]||1) + (parts[2]||1);
                      const p7 = ((parts[0]||1) / t * 100).toFixed(0);
                      const p15 = ((parts[1]||1) / t * 100).toFixed(0);
                      const p30 = ((parts[2]||1) / t * 100).toFixed(0);
                      return (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${p7}%`, background: '#64c896' }}></div>
                            <div style={{ width: `${p15}%`, background: '#6496c8' }}></div>
                            <div style={{ width: `${p30}%`, background: '#c89664' }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px' }}>
                            <span style={{ color: '#64c896' }}>7g {p7}%</span>
                            <span style={{ color: '#6496c8' }}>15g {p15}%</span>
                            <span style={{ color: '#c89664' }}>30g {p30}%</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 최소 수량 모드일 때만 표시 */}
                  {aiConfig.capacityMode === 'minQty' && (
                    <div style={{ padding: '16px', background: 'rgba(100,200,150,0.08)', borderRadius: '10px', border: '1px solid rgba(100,200,150,0.2)' }}>
                      <label style={{ fontSize: '12px', color: '#64c896', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
                        용량별 최소 수량 (제품당)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                          { cap: 7, color: '#64c896' },
                          { cap: 15, color: '#6496c8' },
                          { cap: 30, color: '#c89664' }
                        ].map(({ cap, color }) => (
                          <div key={cap}>
                            <div style={{ fontSize: '11px', color: color, marginBottom: '6px', fontWeight: '500' }}>
                              {cap}g 최소
                            </div>
                            <input
                              type="number"
                              className="input-field"
                              placeholder="0"
                              value={aiConfig[`minQty${cap}g`] || ''}
                              onChange={(e) => setAiConfig(prev => ({
                                ...prev,
                                [`minQty${cap}g`]: parseInt(e.target.value) || 0
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>
                        최소 수량 확보 후 남은 벌크를 위 비율대로 추가 배분합니다
                      </div>
                    </div>
                  )}

                  {/* 비율 기준 모드 안내 */}
                  {aiConfig.capacityMode === 'ratio' && (
                    <div style={{ padding: '14px 16px', background: 'rgba(100,150,200,0.08)', borderRadius: '10px', border: '1px solid rgba(100,150,200,0.15)', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      전체 벌크를 위 비율대로 나눠 수량을 계산합니다. 100개 단위 올림 후 벌크 초과 시 자동 조정됩니다.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Calculate Button */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button 
                  className="ai-btn"
                  onClick={calculateAIRecommendation}
                  disabled={isCalculating || aiConfig.selectedProductNos.length === 0}
                  style={{ margin: '0 auto' }}
                >
                  {isCalculating ? (
                    <>
                      <div className="spinner"></div>
                      계산 중...
                    </>
                  ) : (
                    <>
                      🤖 AI 추천 계산 ({aiConfig.selectedProductNos.length}종 선택됨)
                    </>
                  )}
                </button>
                {aiConfig.selectedProductNos.length === 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#f4a460' }}>
                    ⚠️ 제품을 선택해주세요
                  </div>
                )}
              </div>
              
              {/* AI Results */}
              {aiResult && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#3b82f6',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📋 추천 결과 ({aiResult.summary.selectedProductCount}종 × 3용량 = {aiResult.summary.selectedProductCount * 3} SKU)
                  </h3>
                  
                  {/* Summary Cards */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>예상 총 비용</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: aiResult.summary.budgetExceeded ? '#ff6b6b' : '#d4af37' }}>₩{formatNumber(aiResult.summary.totalCost)}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(100,200,150,0.7)' }}>{formatUSD(aiResult.summary.totalCost)}</div>
                      <div style={{ fontSize: '11px', color: aiResult.summary.budgetExceeded ? '#ff6b6b' : '#64c896' }}>
                        {aiResult.summary.budgetExceeded ? '⚠️ 예산 초과 ' : ''}예산 {aiResult.summary.budgetUsage}% 사용
                      </div>
                    </div>
                    <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>총 생산 수량</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatNumber(aiResult.summary.grandTotalUnits)}개</div>
                    </div>
                    <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>평균 개당 원가</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>₩{formatNumber(aiResult.summary.avgUnitCost)}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>총 벌크 발주량</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatNumber(aiResult.summary.totalBulkKg)}kg</div>
                    </div>
                  </div>
                  
                  {/* Capacity Distribution */}
                  <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>용량별 수량 분포</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      {[
                        { cap: 7, color: '#64c896', note: '(7.5g 충진)' },
                        { cap: 15, color: '#6496c8', note: '(15.5g 충진)' },
                        { cap: 30, color: '#c89664', note: '(30.5g 충진)' }
                      ].map(({ cap, color, note }) => (
                        <div key={cap} style={{ textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '600', 
                            color: color,
                            marginBottom: '4px'
                          }}>
                            {formatNumber(aiResult.summary.totalUnits[cap])}개
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                            {cap}g ({aiResult.summary.capacityDistribution[cap]}%) {note && <span style={{fontSize: '10px', color: 'rgba(255,255,255,0.3)'}}>{note}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recommendation Table */}
                  <div className="scrollbar-thin" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ 
                          position: 'sticky', 
                          top: 0, 
                          background: 'rgba(15, 15, 26, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          {['제품명', '용량', '추천 수량', '사용 벌크', '잔여 벌크', '개당 원가', '총 비용'].map((header, idx) => (
                            <th key={idx} style={{
                              padding: '12px 10px',
                              textAlign: idx === 0 ? 'left' : 'right',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: 'rgba(255,255,255,0.5)',
                              borderBottom: '1px solid rgba(255,255,255,0.08)'
                            }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {aiResult.recommendations.map((rec, idx) => {
                          const isFirstOfProduct = idx % 3 === 0; // 7g, 15g, 30g 순서
                          const remainColor = rec.productRemainingBulkKg < 1 ? '#ff6b6b' : rec.productRemainingBulkKg < 3 ? '#f4a460' : '#64c896';
                          return (
                          <tr key={idx} className="product-row" style={{ borderTop: isFirstOfProduct ? '2px solid rgba(255,255,255,0.08)' : 'none' }}>
                            {isFirstOfProduct && (
                              <td rowSpan={3} style={{ padding: '10px', fontSize: '13px', verticalAlign: 'top', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontWeight: '500' }}>{rec.product.korName}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                                  벌크: {rec.usableBulkKg}kg (실사용)
                                </div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                                  사용: {rec.productTotalBulkUsedKg}kg
                                </div>
                              </td>
                            )}
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <span className="capacity-badge" style={{
                                background: rec.capacity === 7 ? 'rgba(100, 200, 150, 0.2)' :
                                           rec.capacity === 15 ? 'rgba(100, 150, 200, 0.2)' :
                                           'rgba(200, 150, 100, 0.2)',
                                color: rec.capacity === 7 ? '#64c896' :
                                       rec.capacity === 15 ? '#6496c8' : '#c89664'
                              }}>
                                {rec.capacity}g
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '500' }}>
                              {formatNumber(rec.quantity)}개
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              {rec.bulkUsedKg}kg
                            </td>
                            {isFirstOfProduct && (
                              <td rowSpan={3} style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: remainColor, verticalAlign: 'middle' }}>
                                {rec.productRemainingBulkKg}kg
                              </td>
                            )}
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>
                              ₩{formatNumber(rec.unitCost)}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#d4af37' }}>
                              ₩{formatNumber(rec.totalCost)}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Apply Button */}
                  <div style={{ textAlign: 'center' }}>
                    <button className="apply-btn" onClick={applyAIRecommendation}>
                      ✓ 추천 결과 적용하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {/* 초도/재발주 선택 */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '16px 20px', 
                background: 'rgba(212, 175, 55, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>발주 구분:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSubMaterials(prev => ({ ...prev, isInitialOrder: true }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: subMaterials.isInitialOrder ? 'rgba(244, 164, 96, 0.3)' : 'rgba(0,0,0,0.3)',
                        color: subMaterials.isInitialOrder ? '#f4a460' : 'rgba(255,255,255,0.5)',
                        fontSize: '13px',
                        fontWeight: subMaterials.isInitialOrder ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: subMaterials.isInitialOrder ? '2px solid #f4a460' : 'none'
                      }}
                    >
                      🏭 초도 발주
                    </button>
                    <button
                      onClick={() => setSubMaterials(prev => ({ ...prev, isInitialOrder: false }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: !subMaterials.isInitialOrder ? 'rgba(100, 200, 150, 0.3)' : 'rgba(0,0,0,0.3)',
                        color: !subMaterials.isInitialOrder ? '#64c896' : 'rgba(255,255,255,0.5)',
                        fontSize: '13px',
                        fontWeight: !subMaterials.isInitialOrder ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: !subMaterials.isInitialOrder ? '2px solid #64c896' : 'none'
                      }}
                    >
                      🔄 재발주
                    </button>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255,255,255,0.5)',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px'
                }}>
                  {subMaterials.isInitialOrder ? (
                    <span>제조가공비 <span style={{ color: '#f4a460' }}>₩34,000</span> + 벌크통 ₩1,000 (운송비 별도) | 리드타임 <span style={{ color: '#f4a460' }}>6~7주</span></span>
                  ) : (
                    <span>제조가공비 <span style={{ color: '#64c896' }}>₩42,000</span> + 벌크통 ₩1,000 + 운송비 ₩1,500 | 리드타임 <span style={{ color: '#64c896' }}>~4주</span></span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <input
                    type="text"
                    placeholder="제품명, 영문명, 랩넘버로 검색..."
                    className="input-field"
                    style={{ width: '400px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <span style={{ fontSize: '12px', color: '#d4af37', fontWeight: '500', whiteSpace: 'nowrap' }}>일괄 벌크:</span>
                  <input
                    type="number"
                    className="input-field"
                    min="60"
                    step="10"
                    defaultValue={60}
                    id="bulkBatchInput"
                    style={{ width: '80px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>kg</span>
                  <button
                    onClick={() => {
                      const val = parseInt(document.getElementById('bulkBatchInput').value) || 60;
                      const kg = Math.max(60, Math.ceil(val / 10) * 10);
                      const newOrders = {};
                      productData.forEach(p => { newOrders[p.no] = kg; });
                      setProductBulkOrders(newOrders);
                      document.getElementById('bulkBatchInput').value = kg;
                      setBulkApplyMsg(`전체 ${productData.length}개 제품에 ${kg}kg 적용되었습니다.`);
                      setTimeout(() => setBulkApplyMsg(''), 3000);
                    }}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: '1px solid #d4af37',
                      background: 'rgba(212,175,55,0.2)',
                      color: '#d4af37',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    전체 적용
                  </button>
                  {bulkApplyMsg && (
                    <span style={{ fontSize: '11px', color: '#64c896', fontWeight: '500', marginLeft: '8px', animation: 'fadeIn 0.3s' }}>
                      {bulkApplyMsg}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="scrollbar-thin" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      position: 'sticky', 
                      top: 0, 
                      background: 'rgba(15, 15, 26, 0.95)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 10
                    }}>
                      {['No', '국문명', '영문명', '랩넘버', '1Kg 단가', '벌크 발주(Kg)', '7g 수량', '15g 수량', '30g 수량'].map((header, idx) => (
                        <th key={idx} style={{
                          padding: '14px 12px',
                          textAlign: idx < 5 || idx === 5 ? 'left' : 'center',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: idx === 5 ? '#d4af37' : 'rgba(255,255,255,0.5)',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const bulkKg = productBulkOrders[product.no] || 60;
                      const bulkCost = bulkKg * (subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder);
                      return (
                      <tr key={product.no} className="product-row">
                        <td style={{ padding: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                          {product.no}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                          {product.korName}
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'rgba(212,175,55,0.8)' }}>
                          {product.engName}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                          {product.labNum}
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          ₩{formatNumber(subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder)}
                          <div style={{ fontSize: '9px', color: subMaterials.isInitialOrder ? '#f4a460' : '#64c896' }}>
                            {subMaterials.isInitialOrder ? '초도' : '재발주'}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => {
                                const current = productBulkOrders[product.no] || 60;
                                if (current > 60) {
                                  setProductBulkOrders(prev => ({ ...prev, [product.no]: current - 10 }));
                                }
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                border: 'none',
                                background: bulkKg <= 60 ? 'rgba(255,255,255,0.05)' : 'rgba(212, 175, 55, 0.2)',
                                color: bulkKg <= 60 ? 'rgba(255,255,255,0.2)' : '#d4af37',
                                fontSize: '14px',
                                cursor: bulkKg <= 60 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              −
                            </button>
                            <div style={{ 
                              minWidth: '70px', 
                              textAlign: 'center',
                              padding: '4px 8px',
                              background: 'rgba(212, 175, 55, 0.1)',
                              borderRadius: '4px',
                              border: '1px solid rgba(212, 175, 55, 0.2)'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37' }}>{bulkKg}kg</div>
                              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>₩{formatNumber(bulkCost)}</div>
                            </div>
                            <button
                              onClick={() => {
                                const current = productBulkOrders[product.no] || 60;
                                setProductBulkOrders(prev => ({ ...prev, [product.no]: current + 10 }));
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'rgba(212, 175, 55, 0.2)',
                                color: '#d4af37',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        {capacities.map(cap => (
                          <td key={cap.value} style={{ padding: '12px', textAlign: 'center' }}>
                            <input
                              type="number"
                              className="qty-input"
                              min="0"
                              value={getQuantity(product.no, cap.value) || ''}
                              onChange={(e) => handleQuantityChange(product.no, cap.value, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                        ))}
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div style={{ display: 'grid', gap: '24px', maxWidth: '900px' }}>
              {/* 초도/재발주 선택 */}
              <div className="glass-card glow-accent" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏭 발주 구분
                </h3>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '12px 20px',
                    background: subMaterials.isInitialOrder ? 'rgba(244, 164, 96, 0.2)' : 'rgba(0,0,0,0.2)',
                    border: `2px solid ${subMaterials.isInitialOrder ? '#f4a460' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="radio"
                      name="orderType"
                      checked={subMaterials.isInitialOrder}
                      onChange={() => setSubMaterials(prev => ({ ...prev, isInitialOrder: true }))}
                      style={{ accentColor: '#f4a460' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: subMaterials.isInitialOrder ? '#f4a460' : 'rgba(255,255,255,0.7)' }}>초도 발주</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>금형비 포함 · 6~7주</div>
                    </div>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '12px 20px',
                    background: !subMaterials.isInitialOrder ? 'rgba(100, 200, 150, 0.2)' : 'rgba(0,0,0,0.2)',
                    border: `2px solid ${!subMaterials.isInitialOrder ? '#64c896' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="radio"
                      name="orderType"
                      checked={!subMaterials.isInitialOrder}
                      onChange={() => setSubMaterials(prev => ({ ...prev, isInitialOrder: false }))}
                      style={{ accentColor: '#64c896' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: !subMaterials.isInitialOrder ? '#64c896' : 'rgba(255,255,255,0.7)' }}>재발주</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>단가만 적용 · ~4주</div>
                    </div>
                  </label>
                </div>
                
                {/* 코스맥스 비용 구조 표시 */}
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '12px', fontWeight: '500' }}>
                    📦 코스맥스 벌크 단가 구조 (1kg 기준)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: subMaterials.isInitialOrder ? 'rgba(244, 164, 96, 0.15)' : 'rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      border: subMaterials.isInitialOrder ? '1px solid rgba(244, 164, 96, 0.3)' : '1px solid transparent'
                    }}>
                      <div style={{ fontSize: '11px', color: '#f4a460', marginBottom: '8px' }}>초도 발주</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                        <div>내용물: 제품별 상이</div>
                        <div>제조가공비: ₩34,000</div>
                        <div>벌크통: ₩1,000</div>
                        <div>운송비: 별도 실비</div>
                      </div>
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', color: '#f4a460' }}>
                        = 내용물 + ₩35,000
                      </div>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: !subMaterials.isInitialOrder ? 'rgba(100, 200, 150, 0.15)' : 'rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      border: !subMaterials.isInitialOrder ? '1px solid rgba(100, 200, 150, 0.3)' : '1px solid transparent'
                    }}>
                      <div style={{ fontSize: '11px', color: '#64c896', marginBottom: '8px' }}>재발주</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                        <div>내용물: 제품별 상이</div>
                        <div>제조가공비: ₩42,000</div>
                        <div>벌크통: ₩1,000</div>
                        <div>운송비: ₩1,500 (포함)</div>
                      </div>
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', color: '#64c896' }}>
                        = 내용물 + ₩44,500
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    ※ 초도는 30종 동시 발주 Nego 단가 / 재발주는 개별 발주 시 단가
                  </div>
                </div>
              </div>

              {/* 리드실 (영천 씰앤팩) */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6496c8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6496c8' }}></span>
                  리드실 (영천 씰앤팩)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>개당 단가 (원)</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="62"
                      value={subMaterials.leadSeal.price || ''}
                      onChange={(e) => setSubMaterials(prev => ({
                        ...prev,
                        leadSeal: { ...prev.leadSeal, price: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>공급업체</label>
                    <input type="text" className="input-field" value={subMaterials.leadSeal.supplier} readOnly style={{ background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
                
                {/* 초도 금형비 */}
                {subMaterials.isInitialOrder && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(244, 164, 96, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 164, 96, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: '#f4a460', marginBottom: '12px', fontWeight: '500' }}>📋 초도 금형비</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>본금형비 (다이셋트)</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="3,500,000"
                          value={subMaterials.leadSeal.initialMoldCost || ''}
                          onChange={(e) => setSubMaterials(prev => ({
                            ...prev,
                            leadSeal: { ...prev.leadSeal, initialMoldCost: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>본목형비 (톰슨)</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="1,000,000"
                          value={subMaterials.leadSeal.initialDieCost || ''}
                          onChange={(e) => setSubMaterials(prev => ({
                            ...prev,
                            leadSeal: { ...prev.leadSeal, initialDieCost: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>인쇄판비 (플렉소)</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="200,000"
                          value={subMaterials.leadSeal.initialPlateCost || ''}
                          onChange={(e) => setSubMaterials(prev => ({
                            ...prev,
                            leadSeal: { ...prev.leadSeal, initialPlateCost: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#f4a460' }}>
                      소계: ₩{formatNumber((subMaterials.leadSeal.initialMoldCost || 0) + (subMaterials.leadSeal.initialDieCost || 0) + (subMaterials.leadSeal.initialPlateCost || 0))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2차 단상자 */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64c896', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64c896' }}></span>
                  2차 단상자
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>공급업체 선택</label>
                  <select className="select-field" value={subMaterials.secondaryBox.supplier} onChange={(e) => setSubMaterials(prev => ({ ...prev, secondaryBox: { ...prev.secondaryBox, supplier: e.target.value } }))}>
                    <option value="duksu">덕수산업 (3종 동일 단가)</option>
                    <option value="yeonhee">연희 (용량별 단가)</option>
                  </select>
                </div>
                {subMaterials.secondaryBox.supplier === 'duksu' ? (
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>
                      덕수산업 단가 (원) - 7g, 15g, 30g 동일
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="단가 입력"
                      value={subMaterials.secondaryBox.duksuPrice || ''}
                      onChange={(e) => setSubMaterials(prev => ({
                        ...prev,
                        secondaryBox: { ...prev.secondaryBox, duksuPrice: parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <div style={{ 
                      marginTop: '8px',
                      padding: '12px 16px', 
                      background: 'rgba(212,175,55,0.1)', 
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>적용 단가:</span>
                      <span style={{ color: '#d4af37', marginLeft: '8px', fontWeight: '600' }}>₩{formatNumber(subMaterials.secondaryBox.duksuPrice)} (3종 동일)</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[7, 15, 30].map(cap => (
                      <div key={cap}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>{cap}g 단가 (원)</label>
                        <input type="number" className="input-field" placeholder="단가 입력" value={subMaterials.secondaryBox[`yeonhee${cap}g`] || ''} onChange={(e) => setSubMaterials(prev => ({ ...prev, secondaryBox: { ...prev.secondaryBox, [`yeonhee${cap}g`]: parseInt(e.target.value) || 0 } }))} />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 초도 금형비 */}
                {subMaterials.isInitialOrder && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(244, 164, 96, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 164, 96, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: '#f4a460', marginBottom: '12px', fontWeight: '500' }}>📋 초도 금형비</div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>금형비 (목형, 인쇄판 등)</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={subMaterials.secondaryBox.initialMoldCost || ''}
                        onChange={(e) => setSubMaterials(prev => ({
                          ...prev,
                          secondaryBox: { ...prev.secondaryBox, initialMoldCost: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 1차 용기 (연희) */}
              <div className="glass-card" style={{ padding: '20px', opacity: subMaterials.container.excluded ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#c89664', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c89664' }}></span>
                    1차 용기 (연희)
                  </div>
                  <button
                    onClick={() => setSubMaterials(prev => ({ ...prev, container: { ...prev.container, excluded: !prev.container.excluded } }))}
                    style={{
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: subMaterials.container.excluded ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)',
                      background: subMaterials.container.excluded ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: subMaterials.container.excluded ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    {subMaterials.container.excluded ? '제외됨 (클릭하여 포함)' : '비용에서 제외'}
                  </button>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[7, 15, 30].map(cap => (
                    <div key={cap}>
                      <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>{cap}g 단가 (원)</label>
                      <input type="number" className="input-field" placeholder="단가 입력" value={subMaterials.container[`yeonhee${cap}g`] || ''} onChange={(e) => setSubMaterials(prev => ({ ...prev, container: { ...prev.container, [`yeonhee${cap}g`]: parseInt(e.target.value) || 0 } }))} />
                    </div>
                  ))}
                </div>
                
                {/* 초도 금형비 */}
                {subMaterials.isInitialOrder && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(244, 164, 96, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 164, 96, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: '#f4a460', marginBottom: '12px', fontWeight: '500' }}>📋 초도 금형비</div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>금형비</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={subMaterials.container.initialMoldCost || ''}
                        onChange={(e) => setSubMaterials(prev => ({
                          ...prev,
                          container: { ...prev.container, initialMoldCost: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 패드 인쇄 */}
              <div className="glass-card" style={{ padding: '20px', opacity: subMaterials.padPrint.excluded ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37' }}></span>
                    패드 인쇄 (연희)
                  </div>
                  <button
                    onClick={() => setSubMaterials(prev => ({ ...prev, padPrint: { ...prev.padPrint, excluded: !prev.padPrint.excluded } }))}
                    style={{
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: subMaterials.padPrint.excluded ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)',
                      background: subMaterials.padPrint.excluded ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: subMaterials.padPrint.excluded ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    {subMaterials.padPrint.excluded ? '제외됨 (클릭하여 포함)' : '비용에서 제외'}
                  </button>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>인쇄 도수 (1~8도)</label>
                    <select className="select-field" value={subMaterials.padPrint.colors} onChange={(e) => setSubMaterials(prev => ({ ...prev, padPrint: { ...prev.padPrint, colors: parseInt(e.target.value) } }))}>
                      {[1,2,3,4,5,6,7,8].map(n => (<option key={n} value={n}>{n}도</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>도당 추가 단가 (원)</label>
                    <input type="number" className="input-field" placeholder="단가 입력" value={subMaterials.padPrint.pricePerColor || ''} onChange={(e) => setSubMaterials(prev => ({ ...prev, padPrint: { ...prev.padPrint, pricePerColor: parseInt(e.target.value) || 0 } }))} />
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>적용 금액:</span>
                  <span style={{ color: '#d4af37', marginLeft: '8px', fontWeight: '600' }}>₩{formatNumber(subMaterials.padPrint.colors * subMaterials.padPrint.pricePerColor)} / 개</span>
                </div>
                
                {/* 초도 금형비 (동판비) */}
                {subMaterials.isInitialOrder && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(244, 164, 96, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 164, 96, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: '#f4a460', marginBottom: '12px', fontWeight: '500' }}>📋 초도 금형비</div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>동판비 (패드인쇄용)</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={subMaterials.padPrint.initialPlateCost || ''}
                        onChange={(e) => setSubMaterials(prev => ({
                          ...prev,
                          padPrint: { ...prev.padPrint, initialPlateCost: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* 초도 금형비 합계 */}
              {subMaterials.isInitialOrder && (
                <div className="glass-card glow-accent" style={{ padding: '20px', background: 'rgba(244, 164, 96, 0.1)', border: '1px solid rgba(244, 164, 96, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#f4a460' }}>📋 초도 금형비 합계</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>생산 수량에 따라 개당 단가에 분배됩니다</div>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f4a460' }}>
                      ₩{formatNumber(
                        (subMaterials.leadSeal.initialMoldCost || 0) +
                        (subMaterials.leadSeal.initialDieCost || 0) +
                        (subMaterials.leadSeal.initialPlateCost || 0) +
                        (subMaterials.secondaryBox.initialMoldCost || 0) +
                        (subMaterials.container.initialMoldCost || 0) +
                        (subMaterials.padPrint.initialPlateCost || 0)
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filling Service Tab (충전/포장) */}
          {activeTab === 'filling' && (
            <div style={{ maxWidth: '900px' }}>
              <div className="glass-card glow-accent" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏭</div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#d4af37', margin: 0 }}>충전/포장 비용</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>텐져블스토리 Nego 견적 기준 · 충전가공비 + 인/아웃박스</p>
                  </div>
                </div>

                {/* 프로세스 안내 */}
                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(100, 200, 150, 0.1)', borderRadius: '10px', border: '1px solid rgba(100, 200, 150, 0.2)' }}>
                  <div style={{ fontSize: '12px', color: '#64c896', marginBottom: '8px', fontWeight: '500' }}>📋 공정 흐름</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8' }}>
                    <div>1. 코스맥스 내용물 제조 (벌크)</div>
                    <div>2. 코어(1차용기, 연희)에 충진</div>
                    <div>3. 실링지(영천 링필라이너) 노캡 고주파 실링 처리</div>
                    <div>4. 연희에 납품</div>
                  </div>
                </div>

                {/* 수량별 단가 테이블 + MOQ 설정 버튼 */}
                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#d4af37', marginBottom: '12px', fontWeight: '500' }}>📊 수량별 단가표 (Nego 견적 기준) — 클릭하여 적용</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['발주수량', '충전가공비', '인/아웃박스', '합계', ''].map((h, i) => (
                          <th key={i} style={{ padding: '10px', textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {FILLING_COST_TIERS.map((tier, idx) => {
                        const isCurrentTier = subMaterials.fillingService.fillingFee === tier.fillingFee && subMaterials.fillingService.inOutBox === tier.inOutBox;
                        return (
                          <tr key={idx} style={{
                            background: isCurrentTier ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onClick={() => setSubMaterials(prev => ({ ...prev, fillingService: { ...prev.fillingService, fillingFee: tier.fillingFee, inOutBox: tier.inOutBox } }))}
                          >
                            <td style={{ padding: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{tier.label}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px', color: '#f4a460' }}>₩{formatNumber(tier.fillingFee)}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px', color: '#6496c8' }}>₩{formatNumber(tier.inOutBox)}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#d4af37' }}>₩{formatNumber(tier.fillingFee + tier.inOutBox)}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubMaterials(prev => ({ ...prev, fillingService: { ...prev.fillingService, fillingFee: tier.fillingFee, inOutBox: tier.inOutBox } }));
                                }}
                                style={{
                                  padding: '4px 12px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  borderRadius: '6px',
                                  border: isCurrentTier ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                                  background: isCurrentTier ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255,255,255,0.05)',
                                  color: isCurrentTier ? '#d4af37' : 'rgba(255,255,255,0.6)',
                                  cursor: 'pointer',
                                }}
                              >
                                {isCurrentTier ? '적용됨' : 'MOQ 설정'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    ※ 내용물, 제조가공비, 리드씰필름, 용기(사급)는 별도 (각 업체 단가 적용)
                  </div>
                </div>

                {/* 수동 비용 입력 */}
                <div style={{ marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>또는 수동으로 직접 입력:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>💧</span>충전가공비
                    </label>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>코어 충진 + 고주파 실링 서비스</div>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="₩ 단가 입력"
                      value={subMaterials.fillingService.fillingFee || ''}
                      onChange={(e) => setSubMaterials(prev => ({ ...prev, fillingService: { ...prev.fillingService, fillingFee: parseInt(e.target.value) || 0 } }))}
                      style={{ fontSize: '18px', fontWeight: '500' }}
                    />
                  </div>
                  <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📦</span>인/아웃박스
                    </label>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>인박스 + 아웃박스 포장</div>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="₩ 단가 입력"
                      value={subMaterials.fillingService.inOutBox || ''}
                      onChange={(e) => setSubMaterials(prev => ({ ...prev, fillingService: { ...prev.fillingService, inOutBox: parseInt(e.target.value) || 0 } }))}
                      style={{ fontSize: '18px', fontWeight: '500' }}
                    />
                  </div>
                </div>

                {/* 총 단가 표시 */}
                <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>충전/포장 총 단가 (개당)</span>
                    <span style={{ fontSize: '28px', fontWeight: '600', color: '#d4af37' }}>₩{formatNumber(fillingTotalPerUnit)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {[
                      { label: '충전가공비', value: subMaterials.fillingService.fillingFee },
                      { label: '인/아웃박스', value: subMaterials.fillingService.inOutBox },
                    ].map((item, idx) => (
                      <div key={idx} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>₩{formatNumber(item.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 충진 스펙 안내 */}
                <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(100, 150, 200, 0.1)', borderRadius: '8px', borderLeft: '3px solid #6496c8', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  <strong style={{ color: '#6496c8' }}>📋 충진 스펙:</strong> 모든 용량 최소중량 +0.5g 충진 (7g→7.5g, 15g→15.5g, 30g→30.5g) · 노캡 고주파 실링
                </div>
                <div style={{ marginTop: '8px', padding: '14px 16px', background: 'rgba(244, 164, 96, 0.1)', borderRadius: '8px', borderLeft: '3px solid #f4a460', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  <strong style={{ color: '#f4a460' }}>⚠️ 참고:</strong> 7g 제품의 경우 해당 용량 단독 발주 시 8,000개 이상 발주 필요
                </div>
              </div>
            </div>
          )}

          {/* Logistics Tab */}
          {activeTab === 'logistics' && <SupplyChainDiagram isInitialOrder={subMaterials.isInitialOrder} />}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              {calculations.results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
                  <div style={{ fontSize: '14px' }}>제품 탭에서 수량을 입력하거나 AI 추천을 사용해주세요</div>
                </div>
              ) : (
                <>
                  {/* 발주 구분 표시 */}
                  <div style={{ 
                    marginBottom: '16px', 
                    padding: '12px 16px', 
                    background: calculations.isInitialOrder ? 'rgba(244, 164, 96, 0.15)' : 'rgba(100, 200, 150, 0.15)',
                    borderRadius: '8px',
                    border: `1px solid ${calculations.isInitialOrder ? 'rgba(244, 164, 96, 0.3)' : 'rgba(100, 200, 150, 0.3)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{calculations.isInitialOrder ? '🏭' : '🔄'}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: calculations.isInitialOrder ? '#f4a460' : '#64c896' }}>
                        {calculations.isInitialOrder ? '초도 발주' : '재발주'}
                      </span>
                      {calculations.isInitialOrder && (
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                          (금형비 ₩{formatNumber(calculations.totalInitialCost)} 포함)
                        </span>
                      )}
                    </div>
                    {calculations.isInitialOrder && calculations.totalUnits > 0 && (
                      <div style={{ fontSize: '12px', color: '#f4a460' }}>
                        금형비 개당 분담: +₩{formatNumber(calculations.initialCostPerUnit)}
                      </div>
                    )}
                  </div>

                  {/* 인쇄 전용 헤더 */}
                  <div className="print-header" style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>INTRINSIC LINE - 원가 산출 결과</h2>
                    <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                      {new Date().toISOString().slice(0, 10)} | {calculations.isInitialOrder ? '초도 발주' : '재발주'}
                      {calculations.isInitialOrder ? ` (금형비 ₩${formatNumber(calculations.totalInitialCost)} 포함)` : ''}
                    </p>
                  </div>

                  {/* 내보내기 버튼 */}
                  <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                      onClick={exportCSV}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(100, 200, 150, 0.2)',
                        border: '1px solid rgba(100, 200, 150, 0.3)',
                        borderRadius: '8px',
                        color: '#64c896',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      📊 Excel(CSV) 내보내기
                    </button>
                    <button
                      onClick={handlePrint}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(100, 150, 200, 0.2)',
                        border: '1px solid rgba(100, 150, 200, 0.3)',
                        borderRadius: '8px',
                        color: '#6496c8',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      🖨️ PDF 인쇄
                    </button>
                  </div>

                  <div className="scrollbar-thin" style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'auto', marginBottom: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1500px' }}>
                      <thead>
                        <tr style={{ position: 'sticky', top: 0, background: 'rgba(15, 15, 26, 0.95)', backdropFilter: 'blur(10px)' }}>
                          {[
                            '제품명', 
                            '용량', 
                            '희망수량', 
                            '생산수량\n(100단위)',
                            '벌크(Kg)', 
                            '벌크비용\n(코스맥스)', 
                            '1차용기\n(연희)', 
                            '실링지\n(영천씰앤팩)', 
                            '2차단상자', 
                            '충전가공비\n+인/아웃박스',
                            calculations.isInitialOrder ? '금형비\n분담금' : null,
                            '총비용', 
                            '개당원가'
                          ].filter(Boolean).map((header, idx) => (
                            <th key={idx} style={{ 
                              padding: '12px 6px', 
                              textAlign: idx === 0 ? 'left' : 'right', 
                              fontSize: '10px', 
                              fontWeight: '600', 
                              color: 'rgba(255,255,255,0.5)', 
                              borderBottom: '1px solid rgba(255,255,255,0.08)', 
                              whiteSpace: 'pre-line',
                              verticalAlign: 'bottom',
                              lineHeight: '1.3'
                            }}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {calculations.results.map((result, idx) => {
                          const isExpanded = printAllExpanded || expandedResultIdx === idx;
                          const colCount = calculations.isInitialOrder ? 13 : 12;
                          const costItems = [
                            { label: '벌크 (코스맥스)', value: result.bulkCost, perUnit: result.bulkCost / result.productionQty, color: '#d4af37' },
                            { label: '1차용기 (연희)', value: result.containerCost, perUnit: result.containerPrice, color: '#c89664' },
                            { label: '실링지 (영천씰앤팩)', value: result.leadSealCost, perUnit: result.leadSealPrice, color: '#6496c8' },
                            { label: '2차단상자', value: result.boxCost, perUnit: result.boxPrice, color: '#64c896' },
                            { label: '충전가공비', value: result.fillingCostTotal, perUnit: result.fillingPrice, color: '#f4a460' },
                            ...(calculations.isInitialOrder ? [{ label: '금형비 분담', value: result.initialCostShare, perUnit: result.initialCostShare / result.productionQty, color: '#ff6b6b' }] : []),
                          ];
                          const costTotal = costItems.reduce((s, c) => s + c.value, 0);
                          return (<Fragment key={idx}>
                          <tr className="product-row" onClick={() => setExpandedResultIdx(isExpanded ? null : idx)} style={{ cursor: 'pointer' }}>
                            <td style={{ padding: '10px 6px', fontSize: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>▶</span>
                                <div>
                                  <div style={{ fontWeight: '500' }}>{result.product.korName}</div>
                                  <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.7)' }}>{result.product.engName}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                              <span className="capacity-badge" style={{ background: result.capacity === 7 ? 'rgba(100, 200, 150, 0.2)' : result.capacity === 15 ? 'rgba(100, 150, 200, 0.2)' : 'rgba(200, 150, 100, 0.2)', color: result.capacity === 7 ? '#64c896' : result.capacity === 15 ? '#6496c8' : '#c89664' }}>{result.capacity}g</span>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                              {formatNumber(result.requestedQty)}
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#d4af37' }}>
                              {formatNumber(result.productionQty)}
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px' }}>
                              <div>{result.bulkNeededKg}kg</div>
                              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                                (MOQ {result.actualBulkKg}kg)
                              </div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: '#d4af37' }}>
                              <div>₩{formatNumber(result.bulkCost)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.6)' }}>@{formatNumber(result.bulkPricePerKg)}/kg</div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: '#c89664' }}>
                              <div>₩{formatNumber(result.containerCost)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(200,150,100,0.6)' }}>@{formatNumber(result.containerPrice)}</div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: '#6496c8' }}>
                              <div>₩{formatNumber(result.leadSealCost)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(100,150,200,0.6)' }}>@{formatNumber(result.leadSealPrice)}</div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: '#64c896' }}>
                              <div>₩{formatNumber(result.boxCost)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(100,200,150,0.6)' }}>@{formatNumber(result.boxPrice)}</div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: '#f4a460' }}>
                              <div>₩{formatNumber(result.fillingCostTotal)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(244,164,96,0.6)' }}>@{formatNumber(result.fillingPrice)}</div>
                            </td>
                            {calculations.isInitialOrder && (
                              <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', color: '#ff6b6b' }}>
                                ₩{formatNumber(result.initialCostShare)}
                              </td>
                            )}
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#d4af37' }}>
                              <div>₩{formatNumber(result.totalCostWithInitial)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(100,200,150,0.6)' }}>{formatUSD(result.totalCostWithInitial)}</div>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontSize: '12px', fontWeight: '500' }}>
                              <div>₩{formatNumber(result.unitCostWithInitial)}</div>
                              <div style={{ fontSize: '9px', color: 'rgba(100,200,150,0.6)' }}>{formatUSD(result.unitCostWithInitial)}</div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={colCount} style={{ padding: '0', background: 'rgba(212, 175, 55, 0.03)', borderBottom: '2px solid rgba(212, 175, 55, 0.15)' }}>
                                <div style={{ padding: '16px 20px' }}>
                                  <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: '600', marginBottom: '12px' }}>
                                    📊 {result.product.korName} {result.capacity}g — 원가 구조 분해
                                  </div>
                                  {/* 수평 스택 바 차트 */}
                                  <div style={{ display: 'flex', height: '28px', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {costItems.map((item, ci) => {
                                      const pct = costTotal > 0 ? (item.value / costTotal * 100) : 0;
                                      return pct > 0 ? (
                                        <div key={ci} className="print-bar-segment" title={`${item.label}: ${pct.toFixed(1)}%`} style={{
                                          width: `${pct}%`,
                                          background: item.color,
                                          opacity: 0.8,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '9px',
                                          fontWeight: '600',
                                          color: '#1a1a2e',
                                          minWidth: pct > 8 ? 'auto' : '0',
                                          overflow: 'hidden',
                                          whiteSpace: 'nowrap',
                                        }}>
                                          {pct > 8 ? `${pct.toFixed(0)}%` : ''}
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                  {/* 항목별 상세 */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                                    {costItems.map((item, ci) => {
                                      const pct = costTotal > 0 ? (item.value / costTotal * 100) : 0;
                                      return (
                                        <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                          <div className="print-color-dot" style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</div>
                                            <div style={{ fontSize: '12px', fontWeight: '500', color: item.color }}>
                                              ₩{formatNumber(item.value)} <span style={{ fontSize: '9px', color: 'rgba(100,200,150,0.6)' }}>{formatUSD(item.value)}</span>
                                            </div>
                                          </div>
                                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{pct.toFixed(1)}%</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>@₩{formatNumber(item.perUnit)}/개</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {/* 개당 원가 분해 요약 */}
                                  <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>개당 원가 분해</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', fontSize: '11px' }}>
                                      {costItems.map((item, ci) => (
                                        <span key={ci}>
                                          <span style={{ color: item.color, fontWeight: '500' }}>₩{formatNumber(item.perUnit)}</span>
                                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}> ({item.label.split(' ')[0]})</span>
                                          {ci < costItems.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 2px' }}> + </span>}
                                        </span>
                                      ))}
                                      <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 2px' }}> = </span>
                                      <span style={{ color: '#d4af37', fontWeight: '600' }}>₩{formatNumber(result.unitCostWithInitial)}</span>
                                      <span style={{ color: 'rgba(100,200,150,0.6)', fontSize: '10px', marginLeft: '4px' }}>{formatUSD(result.unitCostWithInitial)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </Fragment>);
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary - 세분화된 비용 */}
                  <div style={{ 
                    padding: '20px',
                    background: 'rgba(212, 175, 55, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(212, 175, 55, 0.15)'
                  }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', fontWeight: '500' }}>비용 요약</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>총 생산 수량</div>
                        <div style={{ fontSize: '18px', fontWeight: '500' }}>{formatNumber(calculations.totalUnits)}개</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#d4af37', marginBottom: '4px' }}>벌크 (코스맥스)</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#d4af37' }}>₩{formatNumber(calculations.totalBulkCost)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#c89664', marginBottom: '4px' }}>1차용기 (연희)</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#c89664' }}>₩{formatNumber(calculations.totalContainerCost)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6496c8', marginBottom: '4px' }}>실링지 (영천씰앤팩)</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#6496c8' }}>₩{formatNumber(calculations.totalLeadSealCost)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#64c896', marginBottom: '4px' }}>2차단상자</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#64c896' }}>₩{formatNumber(calculations.totalBoxCost)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#f4a460', marginBottom: '4px' }}>충전가공비+인/아웃박스</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#f4a460' }}>₩{formatNumber(calculations.totalFillingCost)}</div>
                      </div>
                      {calculations.isInitialOrder && (
                        <div>
                          <div style={{ fontSize: '10px', color: '#ff6b6b', marginBottom: '4px' }}>초도 금형비</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ff6b6b' }}>₩{formatNumber(calculations.totalInitialCost)}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* 총 비용 */}
                    <div style={{ 
                      marginTop: '16px', 
                      paddingTop: '16px', 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>총 비용</div>
                        <div style={{ fontSize: '28px', fontWeight: '600', color: '#d4af37' }}>₩{formatNumber(calculations.grandTotal)}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(100,200,150,0.7)', marginTop: '2px' }}>{formatUSD(calculations.grandTotal)}</div>
                      </div>
                      {calculations.totalUnits > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>평균 개당 원가</div>
                          <div style={{ fontSize: '20px', fontWeight: '500' }}>₩{formatNumber(calculations.grandTotal / calculations.totalUnits)}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(100,200,150,0.7)', marginTop: '2px' }}>{formatUSD(calculations.grandTotal / calculations.totalUnits)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profit Analysis Tab */}
          {activeTab === 'profit' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  💰 수익 분석
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
                    소비자가 산출 · 수익 시뮬레이션
                  </span>
                </h2>
                <button
                  className="no-print"
                  onClick={handlePrint}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(100, 150, 200, 0.2)',
                    border: '1px solid rgba(100, 150, 200, 0.3)',
                    borderRadius: '8px',
                    color: '#6496c8',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🖨️ PDF 저장
                </button>
              </div>

              {/* 하위 시트 탭 */}
              <div className="no-print" style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                {[
                  { id: 'main', label: '📊 수익분석' },
                  { id: 'pricing', label: '💲 소비자가 설정' },
                  { id: 'additionalCosts', label: '💸 추가비용' },
                  { id: 'bulk', label: '📈 벌크 단가 통계' },
                  { id: 'benchmark', label: '📐 기준 제품 비교' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setProfitSubTab(t.id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: profitSubTab === t.id ? '600' : '400',
                      borderRadius: '8px 8px 0 0',
                      border: profitSubTab === t.id ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                      borderBottom: profitSubTab === t.id ? '2px solid #d4af37' : '2px solid transparent',
                      background: profitSubTab === t.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                      color: profitSubTab === t.id ? '#d4af37' : 'rgba(255,255,255,0.45)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ===== 벌크 단가 통계 시트 ===== */}
              {profitSubTab === 'bulk' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d4af37', marginBottom: '8px' }}>
                  📈 벌크 단가 통계 ({subMaterials.isInitialOrder ? '초도' : '재발주'}, 30종)
                </h3>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                  = 내용물 ₩{formatNumber(contentStats.content.min)}~{formatNumber(contentStats.content.max)} + 제조가공비 ₩{formatNumber(subMaterials.isInitialOrder ? 34000 : 42000)} + 벌크통 ₩1,000{!subMaterials.isInitialOrder ? ' + 운송비 ₩1,500' : ''}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: '평균', value: contentStats.bulk.avg, color: '#d4af37' },
                    { label: '중앙값', value: contentStats.bulk.median, color: '#6496c8' },
                    { label: '최고', value: contentStats.bulk.max, color: '#ff6b6b', sub: contentStats.bulk.maxProduct?.korName },
                    { label: '최저', value: contentStats.bulk.min, color: '#64c896', sub: contentStats.bulk.minProduct?.korName },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: s.color }}>₩{formatNumber(s.value)}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>/kg ({formatNumber(Math.round(s.value / 10))}/100g)</div>
                      {s.sub && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.sub}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>편차: ₩{formatNumber(contentStats.bulk.max - contentStats.bulk.min)}/kg</span>
                  <span>|</span>
                  <span>비율: {(contentStats.bulk.max / contentStats.bulk.min).toFixed(2)}배</span>
                  <span>|</span>
                  <span>내용물만 최저 ₩{formatNumber(contentStats.content.min)}, 최고 ₩{formatNumber(contentStats.content.max)}/kg</span>
                </div>
              </div>
              )}

              {/* ===== 기준 제품 대비 비용 변동 시트 ===== */}
              {profitSubTab === 'benchmark' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d4af37', margin: 0 }}>📐 기준 제품 대비 비용 변동</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>기준 제품:</span>
                  <select
                    className="select-field"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                    value={benchmarkConfig.referenceProductNo}
                    onChange={(e) => setBenchmarkConfig(prev => ({ ...prev, referenceProductNo: parseInt(e.target.value) }))}
                  >
                    {productData.map(p => (
                      <option key={p.no} value={p.no}>
                        {p.korName} (₩{formatNumber(subMaterials.isInitialOrder ? p.totalInitial : p.totalReorder)}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const refProduct = productData.find(p => p.no === benchmarkConfig.referenceProductNo);
                  const refBulk = refProduct ? (subMaterials.isInitialOrder ? refProduct.totalInitial : refProduct.totalReorder) : 1;

                  return (
                    <div className="scrollbar-thin" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ position: 'sticky', top: 0, background: 'rgba(15, 15, 26, 0.95)' }}>
                            {['No', '제품명', '내용물/kg', '1kg 단가', '내용물/g', '단가/g', '기준 대비', '변동 그래프'].map((h, i) => (
                              <th key={i} style={{ padding: '10px 8px', textAlign: i <= 1 ? 'left' : 'right', fontSize: '10px', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {productData.map((product) => {
                            const bulkCost = subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder;
                            const ratio = bulkCost / refBulk;
                            const isRef = product.no === benchmarkConfig.referenceProductNo;
                            const barWidth = Math.min(ratio * 50, 100);
                            const barColor = ratio > 1.1 ? '#ff6b6b' : ratio < 0.9 ? '#64c896' : '#d4af37';

                            return (
                              <tr key={product.no} className="product-row" style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: isRef ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                              }}>
                                <td style={{ padding: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{product.no}</td>
                                <td style={{ padding: '8px', fontSize: '12px', fontWeight: isRef ? '600' : '400', color: isRef ? '#d4af37' : 'rgba(255,255,255,0.8)' }}>
                                  {product.korName} {isRef && <span style={{ fontSize: '9px', color: '#d4af37' }}>(기준)</span>}
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px' }}>₩{formatNumber(product.contentPrice)}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px', color: '#d4af37' }}>₩{formatNumber(bulkCost)}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>₩{(product.contentPrice / 1000).toFixed(0)}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>₩{(bulkCost / 1000).toFixed(0)}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: barColor }}>
                                  {ratio.toFixed(2)}x
                                </td>
                                <td style={{ padding: '8px', width: '120px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                      <div className="print-bar-segment" style={{ width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.3s' }}></div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
                </div>
              </div>
              )}

              {/* ===== 소비자가 설정 시트 ===== */}
              {profitSubTab === 'pricing' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d4af37', marginBottom: '16px' }}>💲 소비자가 설정</h3>

                {/* 모드 선택 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {[
                    { id: 'benchmark', label: '기준 제품 벤치마크', desc: '기준 제품 ₩/g 설정 → 나머지 자동 산출' },
                    { id: 'uniform', label: '균일 ₩/g', desc: '모든 제품 동일 ₩/g 적용' },
                    { id: 'manual', label: '수동 입력', desc: 'SKU별 개별 입력' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setPricingMode(mode.id)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `2px solid ${pricingMode === mode.id ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                        background: pricingMode === mode.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.2)',
                        color: pricingMode === mode.id ? '#d4af37' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{mode.label}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>{mode.desc}</div>
                    </button>
                  ))}
                </div>

                {/* 벤치마크 모드 */}
                {pricingMode === 'benchmark' && (
                  <div style={{ padding: '20px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>기준 제품</label>
                        <select
                          className="select-field"
                          value={benchmarkConfig.referenceProductNo}
                          onChange={(e) => setBenchmarkConfig(prev => ({ ...prev, referenceProductNo: parseInt(e.target.value) }))}
                        >
                          {productData.map(p => {
                            const bulkCost = subMaterials.isInitialOrder ? p.totalInitial : p.totalReorder;
                            return <option key={p.no} value={p.no}>{p.korName} (벌크 ₩{formatNumber(bulkCost)}/kg = ₩{(bulkCost/1000).toFixed(0)}/g)</option>;
                          })}
                        </select>
                      </div>
                      <div style={{ minWidth: '180px' }}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>기준 제품 소비자가 (₩/g)</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="예: 1000"
                          value={benchmarkConfig.retailPricePerG || ''}
                          onChange={(e) => setBenchmarkConfig(prev => ({ ...prev, retailPricePerG: parseInt(e.target.value) || 0 }))}
                          style={{ fontSize: '18px', fontWeight: '600', color: '#d4af37' }}
                        />
                      </div>
                      {(() => {
                        const refP = productData.find(p => p.no === benchmarkConfig.referenceProductNo);
                        const refBulk = refP ? (subMaterials.isInitialOrder ? refP.totalInitial : refP.totalReorder) : 0;
                        const refCostPerG = refBulk / 1000;
                        const markup = benchmarkConfig.retailPricePerG > 0 && refCostPerG > 0 ? benchmarkConfig.retailPricePerG / refCostPerG : 0;
                        return (
                          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>마크업 배수</div>
                            <div style={{ fontSize: '24px', fontWeight: '600', color: markup > 0 ? '#d4af37' : 'rgba(255,255,255,0.3)' }}>
                              {markup > 0 ? `${markup.toFixed(1)}x` : '-'}
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                              {refCostPerG > 0 ? `원가 ₩${refCostPerG.toFixed(0)}/g → 판매 ₩${benchmarkConfig.retailPricePerG}/g` : ''}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 벤치마크 결과 미리보기 */}
                    {benchmarkConfig.retailPricePerG > 0 && (
                      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>용량별 소비자가 예시 (기준 제품)</div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {[7, 15, 30].map(cap => (
                            <div key={cap} style={{ textAlign: 'center', flex: 1 }}>
                              <div style={{ fontSize: '12px', color: cap === 7 ? '#64c896' : cap === 15 ? '#6496c8' : '#c89664' }}>{cap}g</div>
                              <div style={{ fontSize: '16px', fontWeight: '600' }}>₩{formatNumber(benchmarkConfig.retailPricePerG * cap)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 균일 모드 */}
                {pricingMode === 'uniform' && (
                  <div style={{ padding: '20px', background: 'rgba(100, 150, 200, 0.1)', borderRadius: '12px', border: '1px solid rgba(100, 150, 200, 0.2)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block' }}>균일 소비자가 (₩/g)</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="예: 1000"
                          value={uniformPricePerG || ''}
                          onChange={(e) => setUniformPricePerG(parseInt(e.target.value) || 0)}
                          style={{ fontSize: '18px', fontWeight: '600', color: '#6496c8' }}
                        />
                      </div>
                      {uniformPricePerG > 0 && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {[7, 15, 30].map(cap => (
                            <div key={cap} style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                              <div style={{ fontSize: '12px', color: cap === 7 ? '#64c896' : cap === 15 ? '#6496c8' : '#c89664' }}>{cap}g</div>
                              <div style={{ fontSize: '16px', fontWeight: '600' }}>₩{formatNumber(uniformPricePerG * cap)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      모든 제품에 동일한 ₩/g 적용 → 내용물 비용이 높은 제품일수록 마진이 낮아집니다
                    </div>
                  </div>
                )}

                {/* 수동 모드 안내 */}
                {pricingMode === 'manual' && (
                  <div style={{ padding: '12px 16px', background: 'rgba(244, 164, 96, 0.1)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', borderLeft: '3px solid #f4a460' }}>
                    수익분석 시트의 테이블에서 각 SKU별로 소비자가를 직접 입력하세요.
                  </div>
                )}
              </div>
              )}

              {/* ===== 추가비용 시트 ===== */}
              {profitSubTab === 'additionalCosts' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d4af37', marginBottom: '6px' }}>
                  💸 추가비용 설정 (소비자가 대비 %)
                </h3>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                  소비자가 기준으로 부과되는 비용을 설정합니다. 수익분석 테이블에 실질마진으로 반영됩니다.
                </div>

                {/* 총 추가비용률 요약 */}
                <div style={{ padding: '14px 18px', background: 'rgba(212,175,55,0.08)', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>총 추가비용률</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#d4af37' }}>{totalAdditionalRate.toFixed(1)}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>₩10,000 기준</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#f4a460' }}>→ 추가비용 ₩{formatNumber(Math.round(10000 * totalAdditionalRate / 100))}</div>
                    </div>
                  </div>
                </div>

                {/* 사전 정의 비용 항목 */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontWeight: '500' }}>기본 비용 항목</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {additionalCosts.map((cost, idx) => (
                      <div key={cost.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: cost.enabled ? 'rgba(100,200,150,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px solid ${cost.enabled ? 'rgba(100,200,150,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={cost.enabled}
                            onChange={() => setAdditionalCosts(prev => prev.map((c, i) => i === idx ? { ...c, enabled: !c.enabled } : c))}
                            style={{ accentColor: '#64c896', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '13px', color: cost.enabled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)', fontWeight: cost.enabled ? '500' : '400' }}>{cost.name}</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            value={cost.rate}
                            onChange={(e) => setAdditionalCosts(prev => prev.map((c, i) => i === idx ? { ...c, rate: parseFloat(e.target.value) || 0 } : c))}
                            step="0.1"
                            min="0"
                            style={{ width: '70px', padding: '6px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: cost.enabled ? '#64c896' : 'rgba(255,255,255,0.3)', textAlign: 'right' }}
                          />
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 기타 추가비용 (커스텀) */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontWeight: '500' }}>기타 추가비용</div>
                  {customCosts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                      {customCosts.map((cost, idx) => (
                        <div key={cost.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(100,150,200,0.05)', borderRadius: '8px', border: '1px solid rgba(100,150,200,0.15)' }}>
                          <input
                            type="text"
                            value={cost.name}
                            onChange={(e) => setCustomCosts(prev => prev.map((c, i) => i === idx ? { ...c, name: e.target.value } : c))}
                            placeholder="비용 이름"
                            style={{ flex: 1, padding: '6px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.8)' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              value={cost.rate}
                              onChange={(e) => setCustomCosts(prev => prev.map((c, i) => i === idx ? { ...c, rate: parseFloat(e.target.value) || 0 } : c))}
                              step="0.1"
                              min="0"
                              style={{ width: '70px', padding: '6px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#6496c8', textAlign: 'right' }}
                            />
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>%</span>
                          </div>
                          <button
                            onClick={() => setCustomCosts(prev => prev.filter((_, i) => i !== idx))}
                            style={{ padding: '4px 8px', fontSize: '14px', background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', borderRadius: '4px' }}
                            title="삭제"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setCustomCosts(prev => [...prev, { id: `custom-${Date.now()}`, name: '', rate: 0 }])}
                    style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(100,150,200,0.1)', border: '1px dashed rgba(100,150,200,0.3)', borderRadius: '8px', color: '#6496c8', cursor: 'pointer' }}
                  >+ 기타 추가</button>
                </div>

                {/* 마진 계산 안내 */}
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '10px', fontWeight: '500' }}>📌 마진 계산에 미치는 영향</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                    <div>제품마진 = 소비자가 - 원가</div>
                    <div>추가비용 = 소비자가 × <span style={{ color: '#f4a460' }}>{totalAdditionalRate.toFixed(1)}%</span></div>
                    <div style={{ color: '#64c896', fontWeight: '500' }}>실질마진 = 소비자가 - 원가 - 추가비용</div>
                  </div>
                  {totalAdditionalRate > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      예) 소비자가 ₩10,000, 원가 ₩4,000 → 제품마진 ₩6,000 → 추가비용 ₩{formatNumber(Math.round(10000 * totalAdditionalRate / 100))} → 실질마진 ₩{formatNumber(Math.round(6000 - 10000 * totalAdditionalRate / 100))}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* ===== 메인 시트: 전체 수익 요약 + 제품별 테이블 ===== */}
              {profitSubTab === 'main' && (<>

              {/* 전체 수익 요약 */}
              {(() => {
                const prices = pricingMode === 'manual' ? retailPrices : computedRetailPrices;
                const hasAnyPrice = Object.values(prices).some(v => v > 0);

                if (!hasAnyPrice) return (
                  <div className="glass-card" style={{ padding: '16px 24px', textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>소비자가를 설정하면 수익 요약이 표시됩니다 (💲 소비자가 설정 탭에서 입력)</div>
                  </div>
                );

                let totalRevenue = 0;
                let totalCost = 0;
                let totalUnits = 0;
                let profitableCount = 0;
                let highMarginCount = 0;

                productData.forEach(product => {
                  [7, 15, 30].forEach(cap => {
                    const key = `${product.no}-${cap}`;
                    const retailPrice = prices[key] || 0;
                    const unitCost = getUnitCost(product, cap);
                    const estQty = Math.floor((USABLE_KG * 1000 / 3) / getActualCapacity(cap));
                    totalRevenue += retailPrice * estQty;
                    totalCost += unitCost * estQty;
                    totalUnits += estQty;
                    if (retailPrice > unitCost) profitableCount++;
                    if (retailPrice > 0 && ((retailPrice - unitCost) / retailPrice * 100) >= 50) highMarginCount++;
                  });
                });

                const totalProfit = totalRevenue - totalCost;
                const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
                const totalAdditionalCostAmount = totalRevenue * totalAdditionalRate / 100;
                const totalRealProfit = totalProfit - totalAdditionalCostAmount;
                const realProfitMargin = totalRevenue > 0 ? (totalRealProfit / totalRevenue * 100) : 0;

                // 추정 수량 계산식 문자열
                const qtyFormulas = [7, 15, 30].map(cap => {
                  const actual = getActualCapacity(cap);
                  const estQty = Math.floor((USABLE_KG * 1000 / 3) / actual);
                  return `${cap}g: ${formatNumber(USABLE_KG * 1000 / 3)}g ÷ ${actual}g = ${formatNumber(estQty)}개`;
                }).join('\n');

                return (
                  <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#d4af37', marginBottom: '14px' }}>📈 전체 수익 요약 (30종 × 60kg, 1:1:1 기준 추정)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                      {[
                        { label: '예상 총 매출', value: `₩${formatNumber(totalRevenue)}`, usd: formatUSD(totalRevenue), color: '#64c896',
                          formula: `Σ(소비자가 × 추정수량) 전 SKU 합산\n\n추정수량 (60kg ÷ 3용량 기준):\n${qtyFormulas}\n\n= ₩${formatNumber(totalRevenue)}` },
                        { label: '예상 총 비용', value: `₩${formatNumber(totalCost)}`, usd: formatUSD(totalCost), color: '#ff6b6b',
                          formula: `Σ(원가/개 × 추정수량) 전 SKU 합산\n\n원가 = 벌크/개 + 부자재/개 + 충전비/개\n\n= ₩${formatNumber(totalCost)}` },
                        { label: '제품 순이익', value: `₩${formatNumber(totalProfit)}`, usd: formatUSD(totalProfit), color: totalProfit >= 0 ? '#d4af37' : '#ff6b6b',
                          formula: `총 매출 - 총 비용\n= ₩${formatNumber(totalRevenue)} - ₩${formatNumber(totalCost)}\n= ₩${formatNumber(totalProfit)}` },
                        { label: '제품 마진율', value: `${profitMargin.toFixed(1)}%`, color: profitMargin >= 30 ? '#64c896' : '#f4a460',
                          formula: `제품 순이익 / 총 매출 × 100\n= ₩${formatNumber(totalProfit)} / ₩${formatNumber(totalRevenue)} × 100\n= ${profitMargin.toFixed(1)}%` },
                        ...(totalAdditionalRate > 0 ? [
                          { label: `추가비용 (${totalAdditionalRate.toFixed(1)}%)`, value: `₩${formatNumber(totalAdditionalCostAmount)}`, usd: formatUSD(totalAdditionalCostAmount), color: '#f4a460',
                            formula: `총 매출 × 추가비용률\n= ₩${formatNumber(totalRevenue)} × ${totalAdditionalRate.toFixed(1)}%\n= ₩${formatNumber(totalAdditionalCostAmount)}\n\n내역: ${additionalCosts.filter(c => c.enabled && c.rate > 0).map(c => `${c.name} ${c.rate}%`).concat(customCosts.filter(c => c.rate > 0).map(c => `${c.name || '기타'} ${c.rate}%`)).join(' + ')}` },
                          { label: '실질 순이익', value: `₩${formatNumber(totalRealProfit)}`, usd: formatUSD(totalRealProfit), color: totalRealProfit >= 0 ? '#6496c8' : '#ff6b6b',
                            formula: `제품 순이익 - 추가비용\n= ₩${formatNumber(totalProfit)} - ₩${formatNumber(totalAdditionalCostAmount)}\n= ₩${formatNumber(totalRealProfit)}` },
                          { label: '실질 마진율', value: `${realProfitMargin.toFixed(1)}%`, color: realProfitMargin >= 30 ? '#6496c8' : realProfitMargin >= 0 ? '#f4a460' : '#ff6b6b',
                            formula: `실질 순이익 / 총 매출 × 100\n= ₩${formatNumber(totalRealProfit)} / ₩${formatNumber(totalRevenue)} × 100\n= ${realProfitMargin.toFixed(1)}%` },
                        ] : []),
                        { label: '흑자 SKU', value: `${profitableCount} / 90`, color: '#64c896',
                          formula: `소비자가 > 원가인 SKU 수\n= ${profitableCount}개 / 총 90 SKU (30종 × 3용량)` },
                        { label: '고마진(50%+)', value: `${highMarginCount}개`, color: '#d4af37',
                          formula: `마진율 ≥ 50%인 SKU 수\n(소비자가 - 원가) / 소비자가 × 100 ≥ 50%\n= ${highMarginCount}개` },
                      ].map((c, i) => (
                        <div key={i} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', textAlign: 'center', position: 'relative', cursor: 'help' }} className="summary-card-hover">
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{c.label}</div>
                          <div style={{ fontSize: '17px', fontWeight: '600', color: c.color }}>{c.value}</div>
                          {c.usd && <div style={{ fontSize: '10px', color: 'rgba(100,200,150,0.7)', marginTop: '2px' }}>{c.usd}</div>}
                          {c.formula && (
                            <div className="summary-tooltip" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', padding: '10px 14px', background: '#1a1a2e', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', whiteSpace: 'pre-line', textAlign: 'left', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', lineHeight: '1.6', minWidth: '220px', maxWidth: '320px', zIndex: 40, pointerEvents: 'none', display: 'none' }}>
                              <div style={{ fontSize: '9px', color: '#d4af37', marginBottom: '6px', fontWeight: '600', fontFamily: 'inherit' }}>📐 산출 근거</div>
                              {c.formula}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ===== 4. 제품별 소비자가 & 수익 분석 테이블 ===== */}
              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d4af37', marginBottom: '16px' }}>
                  🏷️ 제품별 소비자가 & 수익 분석
                </h3>

                {/* 용량 필터 */}
                <div className="no-print" style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[
                    { id: 'all', label: '전체' },
                    { id: '7', label: '7g' },
                    { id: '15', label: '15g' },
                    { id: '30', label: '30g' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setProfitCapFilter(t.id)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: profitCapFilter === t.id ? '600' : '400',
                        borderRadius: '6px',
                        border: `1px solid ${profitCapFilter === t.id ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        background: profitCapFilter === t.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                        color: profitCapFilter === t.id ? '#d4af37' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="scrollbar-thin" style={{ overflowX: 'auto' }}>
                  {(() => {
                    const activeAdditionalCosts = [
                      ...additionalCosts.filter(c => c.enabled && c.rate > 0).map(c => ({ name: c.name, rate: c.rate })),
                      ...customCosts.filter(c => c.rate > 0).map(c => ({ name: c.name || '기타', rate: c.rate })),
                    ];
                    const additionalColColors = ['#e06c9f', '#9b59b6', '#e67e22', '#1abc9c', '#3498db', '#e74c3c', '#f39c12', '#2ecc71'];
                    return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: `${900 + (activeAdditionalCosts.length > 0 ? 140 + activeAdditionalCosts.length * 70 : 0)}px` }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {[
                          ...['제품명', '벌크/kg', '용량', '소비자가', '원가/개', '벌크/개', '부자재/개', '충전비/개', '원가바'],
                          ...(activeAdditionalCosts.length > 0 ? ['전체비용바'] : []),
                          ...['제품마진'],
                          ...activeAdditionalCosts.map(c => `${c.name} ${c.rate}%`),
                          ...(activeAdditionalCosts.length > 0 ? ['실질마진', '실질마진율'] : []),
                        ].map((h, i) => (
                          <th key={i} style={{ padding: '6px 4px', textAlign: i <= 0 ? 'left' : 'right', color: 'rgba(255,255,255,0.5)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '10px' }}>{h}</th>
                        ))}
                        <th style={{ padding: '6px 4px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '10px', position: 'relative' }}>
                          <span>마진율</span>
                          <button
                            onClick={() => setShowMarginHelp(!showMarginHelp)}
                            style={{ marginLeft: '4px', width: '16px', height: '16px', borderRadius: '50%', border: '1px solid rgba(212,175,55,0.4)', background: showMarginHelp ? 'rgba(212,175,55,0.2)' : 'transparent', color: '#d4af37', fontSize: '10px', cursor: 'pointer', verticalAlign: 'middle', lineHeight: '14px', padding: 0 }}
                          >?</button>
                          {showMarginHelp && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, width: '300px', padding: '14px', background: '#1e1e3a', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', textAlign: 'left', fontWeight: '400' }}>
                              <div style={{ fontSize: '11px', color: '#d4af37', marginBottom: '8px', fontWeight: '600' }}>마진 지표 설명</div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px', padding: '8px', background: 'rgba(100,200,150,0.06)', borderRadius: '6px', border: '1px solid rgba(100,200,150,0.1)' }}>
                                <div style={{ fontWeight: '600', color: '#64c896', marginBottom: '4px' }}>소비자가 대비 마진율</div>
                                <div style={{ fontFamily: 'monospace', marginBottom: '4px' }}>(판매가 - 원가) / 판매가 × 100</div>
                                <div>매출 중 이익 비중 → 손익분석 기준</div>
                              </div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px', padding: '8px', background: 'rgba(200,150,100,0.06)', borderRadius: '6px', border: '1px solid rgba(200,150,100,0.1)' }}>
                                <div style={{ fontWeight: '600', color: '#c89664', marginBottom: '4px' }}>원가 대비 배수 (마크업)</div>
                                <div style={{ fontFamily: 'monospace', marginBottom: '4px' }}>판매가 / 원가</div>
                                <div>원가의 몇 배로 파는지 → 가격설정 기준</div>
                              </div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>예) 원가 ₩4,000 → 판매가 ₩10,000<br/>→ 마진율 <span style={{ color: '#64c896', fontWeight: '600' }}>60%</span>, 배수 <span style={{ color: '#c89664', fontWeight: '600' }}>×2.5</span></div>
                              {totalAdditionalRate > 0 && (
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                                  추가비용 {totalAdditionalRate.toFixed(1)}% 반영 시 실질마진율은 별도 컬럼에 표시됩니다.
                                </div>
                              )}
                              <button onClick={() => setShowMarginHelp(false)} style={{ marginTop: '8px', padding: '4px 10px', fontSize: '10px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '4px', color: '#d4af37', cursor: 'pointer' }}>닫기</button>
                            </div>
                          )}
                        </th>
                        <th style={{ padding: '6px 4px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: '500', whiteSpace: 'nowrap', fontSize: '10px' }}>배수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productData.map(product => {
                        const bulkCost = subMaterials.isInitialOrder ? product.totalInitial : product.totalReorder;
                        const isRef = product.no === benchmarkConfig.referenceProductNo;
                        const filterCaps = profitCapFilter === 'all' ? [7, 15, 30] : [parseInt(profitCapFilter)];

                        return filterCaps.map((cap, capIdx) => {
                          const key = `${product.no}-${cap}`;
                          const retailPrice = pricingMode === 'manual' ? (retailPrices[key] || 0) : (computedRetailPrices[key] || 0);
                          const breakdown = getUnitCostBreakdown(product, cap);
                          const unitCost = breakdown.bulkCostPerUnit + breakdown.subMaterialPerUnit + breakdown.fillingPerUnit;
                          const margin = retailPrice - unitCost;
                          const marginRate = retailPrice > 0 ? (margin / retailPrice * 100) : 0;
                          const capColor = cap === 7 ? '#64c896' : cap === 15 ? '#6496c8' : '#c89664';

                          const bulkPct = unitCost > 0 ? (breakdown.bulkCostPerUnit / unitCost * 100) : 0;
                          const subPct = unitCost > 0 ? (breakdown.subMaterialPerUnit / unitCost * 100) : 0;
                          const fillPct = unitCost > 0 ? (breakdown.fillingPerUnit / unitCost * 100) : 0;

                          const rowCount = filterCaps.length;
                          return (
                            <tr key={key} className="product-row" style={{
                              borderBottom: capIdx === rowCount - 1 ? '2px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.03)',
                              background: isRef ? 'rgba(212, 175, 55, 0.05)' : 'transparent'
                            }}>
                              {capIdx === 0 && (
                                <>
                                  <td rowSpan={rowCount} style={{ padding: '5px 4px', fontSize: '11px', fontWeight: isRef ? '600' : '400', color: isRef ? '#d4af37' : 'rgba(255,255,255,0.8)', verticalAlign: 'top', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                    {product.korName}
                                    {isRef && <div style={{ fontSize: '9px', color: '#d4af37' }}>(기준)</div>}
                                  </td>
                                  <td rowSpan={rowCount} style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', color: '#d4af37', verticalAlign: 'top', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                    ₩{formatNumber(bulkCost)}
                                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>(₩{(bulkCost/1000).toFixed(0)}/g)</div>
                                  </td>
                                </>
                              )}
                              <td style={{ padding: '5px 4px', textAlign: 'right' }}>
                                <span style={{ padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: `${capColor}22`, color: capColor }}>{cap}g</span>
                              </td>
                              <td style={{ padding: '5px 4px', textAlign: 'right' }}>
                                {pricingMode === 'manual' ? (
                                  <input
                                    type="number"
                                    value={retailPrices[key] || ''}
                                    onChange={(e) => setRetailPrices(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                    placeholder="₩"
                                    style={{ width: '70px', padding: '3px 6px', fontSize: '11px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(100,200,150,0.3)', borderRadius: '4px', color: '#64c896', textAlign: 'right' }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '11px', fontWeight: '500', color: retailPrice > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                                    {retailPrice > 0 ? `₩${formatNumber(retailPrice)}` : '-'}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', color: '#f4a460' }}>
                                ₩{formatNumber(unitCost)}
                              </td>
                              {/* 벌크/개 */}
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '10px', color: '#d4af37' }}>
                                ₩{formatNumber(breakdown.bulkCostPerUnit)}
                                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginLeft: '2px' }}>{bulkPct.toFixed(0)}%</span>
                              </td>
                              {/* 부자재/개 */}
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '10px', color: '#c89664' }}>
                                ₩{formatNumber(breakdown.subMaterialPerUnit)}
                                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginLeft: '2px' }}>{subPct.toFixed(0)}%</span>
                              </td>
                              {/* 충전비/개 */}
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '10px', color: '#6496c8' }}>
                                ₩{formatNumber(breakdown.fillingPerUnit)}
                                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginLeft: '2px' }}>{fillPct.toFixed(0)}%</span>
                              </td>
                              {/* 원가바 */}
                              <td style={{ padding: '5px 4px' }}>
                                <div style={{ display: 'flex', height: '12px', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                  <div className="print-bar-segment" style={{ width: `${bulkPct}%`, background: '#d4af37', transition: 'width 0.3s' }} title={`벌크 ${bulkPct.toFixed(1)}%`} />
                                  <div className="print-bar-segment" style={{ width: `${subPct}%`, background: '#c89664', transition: 'width 0.3s' }} title={`부자재 ${subPct.toFixed(1)}%`} />
                                  <div className="print-bar-segment" style={{ width: `${fillPct}%`, background: '#6496c8', transition: 'width 0.3s' }} title={`충전 ${fillPct.toFixed(1)}%`} />
                                </div>
                              </td>
                              {/* 전체비용바 (추가비용 활성 시) */}
                              {activeAdditionalCosts.length > 0 && (() => {
                                if (retailPrice <= 0) return <td style={{ padding: '5px 4px' }}>-</td>;
                                const costPctOfRetail = unitCost / retailPrice * 100;
                                const eachAdditionalPcts = activeAdditionalCosts.map(c => c.rate);
                                const totalAddPct = eachAdditionalPcts.reduce((s, r) => s + r, 0);
                                const marginPctOfRetail = 100 - costPctOfRetail - totalAddPct;
                                return (
                                  <td style={{ padding: '5px 4px' }}>
                                    <div style={{ display: 'flex', height: '14px', borderRadius: '3px', overflow: 'hidden', minWidth: '80px', position: 'relative' }}>
                                      <div className="print-bar-segment" style={{ width: `${Math.max(0, costPctOfRetail)}%`, background: '#d4af37', transition: 'width 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} title={`원가 ${costPctOfRetail.toFixed(1)}%`}>
                                        {costPctOfRetail >= 8 && <span style={{ fontSize: '8px', color: '#1a1a2e', fontWeight: '700', whiteSpace: 'nowrap' }}>{costPctOfRetail.toFixed(0)}%</span>}
                                      </div>
                                      {eachAdditionalPcts.map((pct, ai) => (
                                        <div key={ai} className="print-bar-segment" style={{ width: `${pct}%`, background: additionalColColors[ai % additionalColColors.length], transition: 'width 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} title={`${activeAdditionalCosts[ai].name} ${pct.toFixed(1)}%`}>
                                          {pct >= 5 && <span style={{ fontSize: '8px', color: '#fff', fontWeight: '700', whiteSpace: 'nowrap' }}>{pct.toFixed(0)}%</span>}
                                        </div>
                                      ))}
                                      <div className="print-bar-segment" style={{ width: `${Math.max(0, marginPctOfRetail)}%`, background: marginPctOfRetail >= 0 ? '#64c896' : '#ff6b6b', transition: 'width 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} title={`순마진 ${marginPctOfRetail.toFixed(1)}%`}>
                                        {marginPctOfRetail >= 8 && <span style={{ fontSize: '8px', color: '#1a1a2e', fontWeight: '700', whiteSpace: 'nowrap' }}>{marginPctOfRetail.toFixed(0)}%</span>}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                      <span>원가 {costPctOfRetail.toFixed(1)}%</span>
                                      <span>마진 {marginPctOfRetail.toFixed(1)}%</span>
                                    </div>
                                  </td>
                                );
                              })()}
                              {/* 제품마진 */}
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', fontWeight: '500', color: margin >= 0 ? '#64c896' : '#ff6b6b' }}>
                                {retailPrice > 0 ? `₩${formatNumber(margin)}` : '-'}
                              </td>
                              {/* 추가비용 항목별 열 */}
                              {activeAdditionalCosts.map((cost, ai) => {
                                const costAmount = retailPrice * cost.rate / 100;
                                return (
                                  <td key={ai} style={{ padding: '5px 4px', textAlign: 'right', fontSize: '10px', color: additionalColColors[ai % additionalColColors.length] }}>
                                    {retailPrice > 0 ? `₩${formatNumber(Math.round(costAmount))}` : '-'}
                                  </td>
                                );
                              })}
                              {/* 실질마진 (추가비용 있을 때만) */}
                              {activeAdditionalCosts.length > 0 && (() => {
                                const additionalCostAmount = retailPrice * totalAdditionalRate / 100;
                                const realMargin = margin - additionalCostAmount;
                                const realMarginRate = retailPrice > 0 ? (realMargin / retailPrice * 100) : 0;
                                return (<>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', fontWeight: '500', color: realMargin >= 0 ? '#6496c8' : '#ff6b6b' }}>
                                    {retailPrice > 0 ? `₩${formatNumber(realMargin)}` : '-'}
                                  </td>
                                  <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', fontWeight: '500', color: realMarginRate >= 50 ? '#6496c8' : realMarginRate >= 30 ? '#f4a460' : '#ff6b6b' }}>
                                    {retailPrice > 0 ? `${realMarginRate.toFixed(1)}%` : '-'}
                                  </td>
                                </>);
                              })()}
                              {/* 마진율 */}
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', fontWeight: '500', color: marginRate >= 50 ? '#64c896' : marginRate >= 30 ? '#f4a460' : '#ff6b6b' }}>
                                {retailPrice > 0 ? `${marginRate.toFixed(1)}%` : '-'}
                              </td>
                              {/* 배수 */}
                              <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#c89664' }}>
                                {retailPrice > 0 && unitCost > 0 ? `×${(retailPrice / unitCost).toFixed(1)}` : '-'}
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                    );
                  })()}
                </div>

                {/* 원가바 범례 */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', paddingLeft: '8px', flexWrap: 'wrap' }}>
                  {[
                    { color: '#d4af37', label: '벌크(내용물)' },
                    { color: '#c89664', label: '부자재' },
                    { color: '#6496c8', label: '충전가공' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      <div className="print-color-dot" style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
                {/* 전체비용바 범례 (추가비용 활성 시) */}
                {(() => {
                  const activeAdditionalCosts2 = [
                    ...additionalCosts.filter(c => c.enabled && c.rate > 0).map(c => ({ name: c.name, rate: c.rate })),
                    ...customCosts.filter(c => c.rate > 0).map(c => ({ name: c.name || '기타', rate: c.rate })),
                  ];
                  const additionalColColors2 = ['#e06c9f', '#9b59b6', '#e67e22', '#1abc9c', '#3498db', '#e74c3c', '#f39c12', '#2ecc71'];
                  if (activeAdditionalCosts2.length === 0) return null;
                  return (
                    <div style={{ marginTop: '6px', paddingLeft: '8px' }}>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>전체비용바</div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                          <div className="print-color-dot" style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d4af37' }} />
                          원가
                        </div>
                        {activeAdditionalCosts2.map((cost, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                            <div className="print-color-dot" style={{ width: '10px', height: '10px', borderRadius: '2px', background: additionalColColors2[i % additionalColColors2.length] }} />
                            {cost.name} {cost.rate}%
                          </div>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                          <div className="print-color-dot" style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#64c896' }} />
                          순마진
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              </>)}

            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📂 저장/불러오기
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
                  설정 스냅샷 관리
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={fetchSnapshots}
                    disabled={historyLoading}
                    style={{
                      padding: '4px 10px', background: 'rgba(100, 150, 200, 0.2)',
                      border: '1px solid rgba(100, 150, 200, 0.3)', borderRadius: '6px',
                      color: '#6496c8', fontSize: '11px', cursor: historyLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {historyLoading ? '...' : '새로고침'}
                  </button>
                </div>
              </h2>

              {/* 저장 */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', color: '#d4af37', marginBottom: '12px', fontWeight: '500' }}>현재 설정 저장</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="라벨 입력 (선택사항)"
                    value={historyLabel}
                    onChange={(e) => setHistoryLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveHistory(historyLabel)}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => saveHistory(historyLabel)}
                    style={{
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)',
                      border: 'none', borderRadius: '8px', color: '#1a1a2e',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    💾 저장
                  </button>
                </div>
              </div>

              {/* 내 스냅샷 섹션 */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#d4af37', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📌 내 스냅샷
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({historySnapshots.length}개)</span>
                </h3>
                {historySnapshots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'rgba(255,255,255,0.4)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>📂</div>
                    <div style={{ fontSize: '13px' }}>저장된 스냅샷이 없습니다</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {historySnapshots.map((snap) => {
                      const d = new Date(snap.created_at || snap.timestamp);
                      const timeStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                      return (
                        <div key={snap.id} className="glass-card" style={{
                          padding: '14px 18px', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: '12px'
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#e8e6e3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {snap.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>{timeStr}</span>
                              {snap.is_shared && <span style={{ color: '#6496c8' }}>공유중</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            {/* 공유 토글 */}
                            <button
                              onClick={() => toggleShare(snap.id, snap.is_shared)}
                              title={snap.is_shared ? '공유 해제' : '공유하기'}
                              style={{
                                padding: '6px 10px',
                                background: snap.is_shared ? 'rgba(100, 150, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${snap.is_shared ? 'rgba(100, 150, 200, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '6px',
                                color: snap.is_shared ? '#6496c8' : 'rgba(255,255,255,0.4)',
                                fontSize: '11px', cursor: 'pointer',
                              }}
                            >
                              {snap.is_shared ? '공유 ON' : '공유 OFF'}
                            </button>
                            <button
                              onClick={() => { loadHistory(snap); setActiveTab('results'); }}
                              style={{
                                padding: '6px 14px', background: 'rgba(100, 200, 150, 0.2)',
                                border: '1px solid rgba(100, 200, 150, 0.3)', borderRadius: '6px',
                                color: '#64c896', fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                              }}
                            >
                              불러오기
                            </button>
                            <button
                              onClick={() => deleteHistory(snap.id)}
                              style={{
                                padding: '6px 10px', background: 'rgba(255, 107, 107, 0.15)',
                                border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: '6px',
                                color: '#ff6b6b', fontSize: '11px', cursor: 'pointer',
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 공유된 스냅샷 섹션 */}
              <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#6496c8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🌐 공유된 스냅샷
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({sharedSnapshots.length}개)</span>
                  </h3>
                  {sharedSnapshots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'rgba(255,255,255,0.4)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>🌐</div>
                      <div style={{ fontSize: '13px' }}>공유된 스냅샷이 없습니다</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {sharedSnapshots.map((snap) => {
                        const d = new Date(snap.created_at || snap.timestamp);
                        const timeStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                        return (
                          <div key={snap.id} className="glass-card" style={{
                            padding: '14px 18px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', gap: '12px',
                            borderColor: 'rgba(100, 150, 200, 0.15)',
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: '#e8e6e3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {snap.label}
                              </div>
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#6496c8' }}>{snap.nickname}</span>
                                <span>{timeStr}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => { loadHistory(snap); setActiveTab('results'); }}
                              style={{
                                padding: '6px 14px', background: 'rgba(100, 150, 200, 0.2)',
                                border: '1px solid rgba(100, 150, 200, 0.3)', borderRadius: '6px',
                                color: '#6496c8', fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                              }}
                            >
                              불러오기
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && isAdmin && (
            <div style={{ maxWidth: '900px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🔒 관리자 패널
                <button
                  onClick={fetchAdminData}
                  style={{
                    marginLeft: 'auto', padding: '4px 12px', background: 'rgba(100, 150, 200, 0.2)',
                    border: '1px solid rgba(100, 150, 200, 0.3)', borderRadius: '6px',
                    color: '#6496c8', fontSize: '11px', cursor: 'pointer',
                  }}
                >
                  데이터 새로고침
                </button>
              </h2>

              {/* 사용자 관리 */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#d4af37', marginBottom: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  사용자 목록
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({adminUsers.length}명)</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>
                  사용자 초대는 Supabase Dashboard &gt; Authentication &gt; Users에서 직접 추가하세요.
                </div>
                {adminUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    데이터를 불러오려면 "데이터 새로고침"을 클릭하세요
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {adminUsers.map((u) => {
                      const d = new Date(u.created_at);
                      const timeStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
                      return (
                        <div key={u.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                          borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', color: '#e8e6e3', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{u.display_name || u.email}</span>
                              <span style={{
                                padding: '1px 6px', fontSize: '10px', borderRadius: '4px', fontWeight: '600',
                                background: u.role === 'admin' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(100, 150, 200, 0.2)',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(100, 150, 200, 0.3)'}`,
                                color: u.role === 'admin' ? '#ff6b6b' : '#6496c8',
                              }}>
                                {u.role === 'admin' ? '관리자' : '일반'}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                              {u.email} · 가입: {timeStr}
                            </div>
                          </div>
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleChangeUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                              style={{
                                padding: '4px 10px',
                                background: u.role === 'admin' ? 'rgba(100, 150, 200, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(100, 150, 200, 0.3)' : 'rgba(255, 107, 107, 0.3)'}`,
                                borderRadius: '6px',
                                color: u.role === 'admin' ? '#6496c8' : '#ff6b6b',
                                fontSize: '11px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                              }}
                            >
                              {u.role === 'admin' ? '일반으로 변경' : '관리자로 변경'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 최근 접속 기록 */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#64c896', marginBottom: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  최근 접속 기록
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({adminAccessLog.length}건)</span>
                </div>
                {adminAccessLog.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    데이터를 불러오려면 "데이터 새로고침"을 클릭하세요
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>이메일</th>
                          <th style={{ textAlign: 'left', padding: '8px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>접속 시각</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminAccessLog.map((log) => {
                          const d = new Date(log.logged_in_at);
                          const timeStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
                          return (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '6px 12px', color: '#e8e6e3' }}>{log.email || log.nickname}</td>
                              <td style={{ padding: '6px 12px', color: 'rgba(255,255,255,0.5)' }}>{timeStr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 전체 스냅샷 관리 */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '14px', color: '#6496c8', marginBottom: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  전체 스냅샷 관리
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({adminSnapshots.length}개)</span>
                </div>
                {adminSnapshots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    데이터를 불러오려면 "데이터 새로고침"을 클릭하세요
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                    {adminSnapshots.map((snap) => {
                      const d = new Date(snap.created_at);
                      const timeStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                      return (
                        <div key={snap.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                          borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', color: '#e8e6e3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {snap.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                              <span style={{ color: '#6496c8' }}>{snap.nickname}</span>
                              <span>{timeStr}</span>
                              {snap.is_shared && <span style={{ color: '#64c896' }}>공유</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => adminDeleteSnapshot(snap.id)}
                            style={{
                              padding: '4px 10px', background: 'rgba(255, 107, 107, 0.15)',
                              border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: '6px',
                              color: '#ff6b6b', fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="no-print" style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '32px' }}>
        <p>코스맥스 네오 | 최소 벌크 발주수량 60Kg (전량 사용) | 모든 용량: 최소중량 +0.5g 충진 | 코어 충진 + 노캡 고주파 실링 → 연희 납품</p>
        <p style={{ marginTop: '4px' }}>초도: 내용물 + 제조가공비 ₩34,000 + 벌크통 ₩1,000 | 재발주: 내용물 + 제조가공비 ₩42,000 + 벌크통 ₩1,000 + 운송비 ₩1,500</p>
      </div>
    </div>
  );
}
