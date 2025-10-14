// data.js 파일

// 요일 이름 (계산 및 표시용)
const weekdayName = ['일', '월', '화', '수', '목', '금', '토'];

// 강좌 목록 (트리 메뉴 생성용)
const courseTree = [
  {cat:'SAT', items:[
    {val:'sat_1500', label:'겨울특강 SAT 1500+'},
    {val:'sat_1400', label:'겨울특강 SAT 1400+'},
    {val:'sat_bridge', label:'겨울특강 SAT 브릿지'},
    {val:'sat_america', label:'겨울특강 SAT 아메리카반'},
    {val:'sat_europe', label:'겨울특강 SAT 유럽반'},
    {val:'sat_rw', label:'겨울특강 SAT RW실전반'}
  ]},
  {cat:'AP', items:[
    {val:'ap_phy1', label:'겨울특강 AP Phy1'},
    {val:'ap_calbc', label:'겨울특강 AP Cal BC'},
    {val:'ap_calab', label:'겨울특강 AP Cal AB'},
    {val:'ap_precal', label:'겨울특강 AP Pre-cal'},
    {val:'ap_worldhis', label:'겨울특강 AP World His'},
    {val:'ap_bio', label:'겨울특강 AP Bio'},
    {val:'ap_phyc_m', label:'겨울특강 AP Phy C-M'},
    {val:'ap_macroecon', label:'겨울특강 AP Macro Econ'},
    {val:'ap_microecon', label:'겨울특강 AP Micro Econ'},
    {val:'ap_psy', label:'겨울특강 AP Psy'},
    {val:'ap_stat', label:'겨울특강 AP Stat'},
    {val:'ap_chem', label:'겨울특강 AP Chem'},
    {val:'ap_comsca', label:'겨울특강 AP Com.sc A'}
  ]},
  {cat:'TOEFL', items:[
    {val:'toefl_l1', label:'겨울특강 TOEFL L1'},
    {val:'toefl_l2', label:'겨울특강 TOEFL L2'},
    {val:'toefl_america', label:'겨울특강 TOEFL 미주반'},
    {val:'toefl_awesome', label:'겨울특강 어썸실전'}
  ]},
  {cat:'DRW', items:[
    {val:'drw_morning', label:'겨울특강 DRW 오전'},
    {val:'drw_a', label:'겨울특강 DRW A'},
    {val:'drw_b', label:'겨울특강 DRW B'},
  ]},
  {cat:'W올인원', items:[
    {val:'w_allinone', label:'겨울특강 Writing 올인원'}
  ]},
  {cat:'Drill Math', items:[
    {val:'dm_alg1', label:'겨울특강 Algebra 1'},
    {val:'dm_alg2', label:'겨울특강 Algebra 2'},
    {val:'dm_alg2adv', label:'겨울특강 Algebra 2 심화'}
  ]}
];

// 강좌별 상세 정보 (가격, 기간, 요일)
const courseInfo = {
  sat_1500: {name:"겨울특강 SAT 1500+", min:1, max:4, durationType:"week", fee:950000, days:[1]},
  sat_1400: {name:"겨울특강 SAT 1400+", min:1, max:4, durationType:"week", fee:950000, days:[1]},
  sat_bridge: {name:"겨울특강 SAT 브릿지", min:1, max:4, durationType:"week", fee:950000, days:[1]},
  sat_america: {name:"겨울특강 SAT 아메리카반", min:1, max:4, durationType:"week", fee:620000, days:[1]},
  sat_europe: {name:"겨울특강 SAT 유럽반", min:1, max:4, durationType:"week", fee:620000, days:[1]},
  sat_rw: {name:"겨울특강 SAT RW실전반", min:1, max:4, durationType:"week", fee:248000, days:[6], endDay:0},
  
  ap_phy1: {name:"겨울특강 AP Phy1", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_calbc: {name:"겨울특강 AP Cal BC", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_calab: {name:"겨울특강 AP Cal AB", min:1, max:3, durationType:"week", fee:460000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_precal: {name:"겨울특강 AP Pre-cal", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_worldhis: {name:"겨울특강 AP World His", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_bio: {name:"겨울특강 AP Bio", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_phyc_m: {name:"겨울특강 AP Phy C-M", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_macroecon: {name:"겨울특강 AP Macro Econ", min:1, max:3, durationType:"week", fee:345000, days:[2,4,6], isAP:true, endDay:6},
  ap_microecon: {name:"겨울특강 AP Micro Econ", min:1, max:3, durationType:"week", fee:345000, days:[1,3,5], isAP:true, endDay:5},
  ap_psy: {name:"겨울특강 AP Psy", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_stat: {name:"겨울특강 AP Stat", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_chem: {name:"겨울특강 AP Chem", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  ap_comsca: {name:"겨울특강 AP Com.sc A", min:1, max:3, durationType:"week", fee:575000, days:[1,2,3,4,5], isAP:true, endDay:5},
  
  toefl_l1: {name:"겨울특강 TOEFL L1", min:1, max:4, durationType:"week", fee:540000, days:[1]},
  toefl_l2: {name:"겨울특강 TOEFL L2", min:1, max:4, durationType:"week", fee:540000, days:[1]},
  toefl_america: {name:"겨울특강 TOEFL 미주반", min:1, max:4, durationType:"week", fee:540000, days:[1]},
  toefl_awesome: {name:"겨울특강 어썸실전", min:1, max:6, durationType:"set", fee:198000, days:[6]},
  
  drw_morning: {name:"겨울특강 DRW 오전", min:1, max:3, durationType:"week", fee:360000, days:[1]},
  drw_a: {name:"겨울특강 DRW A", min:1, max:3, durationType:"week", fee:360000, days:[1]},
  drw_b: {name:"겨울특강 DRW B", min:1, max:3, durationType:"week", fee:360000, days:[1]},
  
  w_allinone: {name:"겨울특강 Writing 올인원", min:1, max:3, durationType:"week", fee:480000, days:[1]},
  
  dm_alg1: {name:"겨울특강 Algebra 1", min:1, max:3, durationType:"week", fee:265000, days:[1]},
  dm_alg2: {name:"겨울특강 Algebra 2", min:1, max:3, durationType:"week", fee:265000, days:[1]},
  dm_alg2adv: {name:"겨울특강 Algebra 2 심화", min:1, max:3, durationType:"week", fee:265000, days:[1]}
};

// 강좌별 수업 시간표
const timeTable = {
  "겨울특강 SAT 1500+": { "온라인": "13:00~21:00", "오프라인": "09:00~17:00" },
  "겨울특강 SAT 1400+": { "온라인": "13:00~21:00", "오프라인": "09:00~17:00" },
  "겨울특강 SAT 브릿지": { "온라인": "13:00~21:00", "오프라인": "09:00~17:00" },
  "겨울특강 SAT 아메리카반": "09:00~13:00",
  "겨울특강 SAT 유럽반": "17:00~21:00",
  "겨울특강 SAT RW실전반": "10:00~14:00",
  
  "겨울특강 AP Phy1": {"1차":"18:20~20:20", "2차":"09:00~11:00", "3차오전":"09:00~11:00", "3차저녁":"18:20~20:20"},
  "겨울특강 AP Cal BC": {"1차":"18:20~20:20", "2차":"09:00~11:00", "3차오전":"09:00~11:00", "3차저녁":"18:20~20:20"},
  "겨울특강 AP Cal AB": {"1차":"18:20~20:20", "2차":"09:00~11:00", "3차오전":"09:00~11:00", "3차저녁":"18:20~20:20"},
  "겨울특강 AP Pre-cal": {"1차":"18:20~20:20", "2차":"09:00~11:00", "3차오전":"09:00~11:00", "3차저녁":"18:20~20:20"},
  "겨울특강 AP World His": {"1차":"18:20~20:20", "2차":"09:00~11:00", "3차오전":"09:00~11:00", "3차저녁":"18:20~20:20"},
  "겨울특강 AP Bio": {"1차":"18:20~20:20", "2차":"09:00~11:00", "3차오전":"09:00~11:00", "3차저녁":"18:20~20:20"},
  "겨울특강 AP Phy C-M": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  "겨울특강 AP Macro Econ": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  "겨울특강 AP Micro Econ": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  "겨울특강 AP Psy": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  "겨울특강 AP Stat": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  "겨울특강 AP Chem": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  "겨울특강 AP Com.sc A": {"1차":"20:30~22:30", "2차":"11:10~13:10", "3차오전":"11:10~13:10", "3차저녁":"20:30~22:30"},
  
  "겨울특강 TOEFL L1": { "온라인": "13:30~17:30", "오프라인": "09:00~13:00" },
  "겨울특강 TOEFL L2": { "온라인": "13:30~17:30", "오프라인": "09:00~13:00" },
  "겨울특강 TOEFL 미주반": "09:00~13:00",
  "겨울특강 어썸실전": "11:00~14:00",
  
  "겨울특강 DRW 오전": "10:00~13:00",
  "겨울특강 DRW A": "19:00~22:00",
  "겨울특강 DRW B": "20:00~23:00",
  
  "겨울특강 Writing 올인원": "09:00~13:00",
  
  "겨울특강 Algebra 1": "14:00~16:00",
  "겨울특강 Algebra 2": { "온라인": "16:10~18:10", "오프라인": "14:00~16:00" },
  "겨울특강 Algebra 2 심화": "16:10~18:10"
};

// AP 강좌 차수 정보
const apSessionInfo = {
  '1': { label: '1차', start: '2025-12-15', maxDuration: 3 },
  '2': { label: '2차', start: '2025-12-22', maxDuration: 3 },
  '3': { label: '3차', start: '2026-01-12', maxDuration: 3 }
};

// ✅ 녹화강의 가능 여부 (과목별)
const recordingAvailable = {
  // SAT
  sat_1500: { 온라인: true, 오프라인: false },
  sat_1400: { 온라인: true, 오프라인: false },
  sat_bridge: { 온라인: true, 오프라인: false },
  sat_america: true,
  sat_europe: true,
  sat_rw: false, // 토일 과목
  
  // AP (모두 가능)
  ap_phy1: true,
  ap_calbc: true,
  ap_calab: true,
  ap_precal: true,
  ap_worldhis: true,
  ap_bio: true,
  ap_phyc_m: true,
  ap_macroecon: true,
  ap_microecon: true,
  ap_psy: true,
  ap_stat: true,
  ap_chem: true,
  ap_comsca: true,
  
  // TOEFL
  toefl_l1: { 온라인: true, 오프라인: false },
  toefl_l2: { 온라인: true, 오프라인: false },
  toefl_america: true,
  toefl_awesome: false, // set 과목
  
  // DRW (모두 가능)
  drw_morning: true,
  drw_a: true,
  drw_b: true,
  
  // Writing (오프라인 - 불가)
  w_allinone: false,
  
  // Drill Math
  dm_alg1: true,
  dm_alg2: { 온라인: true, 오프라인: false },
  dm_alg2adv: true
};