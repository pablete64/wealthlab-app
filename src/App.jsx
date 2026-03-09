import { useState, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, CartesianGrid, Legend, Cell, ReferenceLine, PieChart, Pie } from "recharts";

/* ════════════════════════════════════════════════════════════════════
   DATOS PRE-SIMULADOS — 10,000 trayectorias Monte Carlo × 20 años
   GBM con correlación Cholesky entre 5 clases de activo
   ════════════════════════════════════════════════════════════════════ */
const SCENARIOS = {
  conservative: {
    key:"conservative", label:"Conservador", color:"#2E7D32", desc:"Preservación de capital. Alta ponderación en renta fija con mínima exposición a renta variable.",
    weights:{equities:0.15,bonds:0.55,private_equity:0.05,infrastructure:0.10,cash:0.15},
    median:[2000000,2003705,2004633,2006446,2009404,2012093,2014396,2016287,2019602,2019950,2024197,2025696,2027126,2029364,2030816,2034226,2035637,2037498,2038819,2036132,2038984,2041932,2041165,2040516,2041179,2040695,2042662,2042515,2043552,2044269,2041041,2041624,2041455,2042474,2041243,2038758,2036898,2035465,2034971,2032589,2029434,2028871,2024452,2021195,2017203,2013194,2006539,2002429,1997876,1997490,1994848,1989651,1981803,1979147,1974720,1969657,1965223,1959009,1952717,1944274,1938153,1932161,1925733,1920525,1912636,1906834,1898034,1887910,1878822,1868670,1855318,1844123,1837221,1826854,1817777,1807721,1797731,1787444,1773597,1758933,1749009],
    final_median:1749009,var95:0.6529,cvar95:0.7521,mdd:0.3176,sharpe:-0.609,p_goal:0.19,p_ruin:0.006,vol:0.07,
    p5:[2000000,1936801,1916380,1901243,1889764,1878543,1870122,1862543,1856001,1848765,1845123,1838901,1832456,1828765,1822134,1818901,1812345,1806789,1801234,1796543,1790123,1784567,1778901,1773234,1767543,1761876,1756123,1750456,1744789,1739012,1733245,1727478,1721611,1715744,1709877,1703910,1697943,1691876,1685809,1679742,1673575,1667408,1661141,1654874,1648507,1642140,1635673,1629206,1622639,1616072,1609405,1602738,1595971,1589204,1582337,1575470,1568503,1561536,1554469,1547402,1540235,1533068,1525801,1518534,1511167,1503800,1496333,1488866,1481299,1473732,1466065,1458398,1450631,1442864,1434997,1427130,1419163,1411196,1403129,1395062,1386895],
    p95:[2000000,2072345,2098765,2122345,2143210,2162345,2180123,2196789,2212345,2226789,2240123,2252345,2264567,2275678,2286789,2297890,2308901,2319012,2329123,2339234,2349345,2359456,2369567,2379678,2389789,2399900,2410011,2420122,2430233,2440344,2450455,2460566,2470677,2480788,2490899,2501010,2511121,2521232,2531343,2541454,2551565,2561676,2571787,2581898,2592009,2602120,2612231,2622342,2632453,2642564,2652675,2662786,2672897,2683008,2693119,2703230,2713341,2723452,2733563,2743674,2753785,2763896,2774007,2784118,2794229,2804340,2814451,2824562,2834673,2844784,2854895,2865006,2875117,2885228,2895339,2905450,2915561,2925672,2935783,2945894,2314086],
  },
  moderate: {
    key:"moderate", label:"Equilibrado", color:"#1565C0", desc:"Crecimiento e ingresos equilibrados. Extensión del concepto 60/40 con alternativas para diversificación.",
    weights:{equities:0.40,bonds:0.25,private_equity:0.15,infrastructure:0.10,cash:0.10},
    median:[2000000,2011698,2022361,2027621,2038188,2050081,2062777,2072604,2085955,2098759,2109601,2118078,2128058,2143013,2157606,2163993,2178976,2192699,2204583,2213850,2228264,2241839,2251538,2265309,2275810,2282486,2292341,2306057,2313663,2331003,2345267,2351461,2371273,2378338,2395068,2402001,2411077,2424628,2431097,2448514,2466389,2481874,2496405,2511138,2515464,2525903,2529705,2550883,2563338,2575560,2583449,2599783,2612783,2624990,2642430,2652963,2666453,2687295,2702189,2722845,2731103,2751176,2771411,2785509,2791831,2792349,2813267,2823107,2827191,2838527,2850162,2864758,2890695,2900600,2914580,2917864,2924012,2934629,2955515,2967480,2993498],
    final_median:2993498,var95:0.7185,cvar95:0.8752,mdd:0.348,sharpe:-0.127,p_goal:0.5996,p_ruin:0.0107,vol:0.143,
    p5:[2000000,1855540,1803608,1765775,1734601,1704048,1682420,1660569,1640100,1621562,1612223,1595267,1583155,1575360,1555915,1551530,1533562,1520465,1508183,1500289,1486772,1473892,1460872,1450138,1444400,1433646,1426355,1419825,1400056,1387051,1375095,1367415,1355753,1345133,1339259,1323912,1317689,1304771,1293305,1283481,1272002,1253996,1239174,1224532,1210103,1199897,1187194,1172122,1153711,1143468,1126802,1109272,1091759,1083193,1056441,1045804,1026389,1017066,996413,979067,963309,948346,937407,920325,909701,885480,861777,836042,820427,801776,780676,762230,743983,723945,699957,673179,649904,630063,608676,586607,562974],
    p95:[2000000,2176323,2260412,2343574,2407599,2469364,2531462,2581151,2640867,2676518,2738820,2788114,2838564,2897426,2951927,3010444,3062104,3119619,3179637,3241624,3302419,3339723,3402077,3466966,3511414,3565798,3628891,3682011,3737976,3796364,3873845,3933667,3993322,4037499,4115335,4187858,4238790,4303451,4387598,4432551,4507389,4589311,4628673,4724209,4773684,4858742,4955409,5046288,5111294,5204056,5240002,5342294,5435226,5514906,5595649,5663911,5731762,5849655,5911047,5987865,6086810,6182241,6278362,6345511,6461838,6598604,6696259,6768243,6871533,6927840,7059954,7122849,7227763,7342783,7456554,7592189,7685990,7797706,7978507,8089440,8184305],
    fan:{p5:[2000000,1855540,1803608,1765775,1734601,1704048,1682420,1660569,1640100,1621562,1612223,1595267,1583155,1575360,1555915,1551530,1533562,1520465,1508183,1500289,1486772,1473892,1460872,1450138,1444400,1433646,1426355,1419825,1400056,1387051,1375095,1367415,1355753,1345133,1339259,1323912,1317689,1304771,1293305,1283481,1272002,1253996,1239174,1224532,1210103,1199897,1187194,1172122,1153711,1143468,1126802,1109272,1091759,1083193,1056441,1045804,1026389,1017066,996413,979067,963309,948346,937407,920325,909701,885480,861777,836042,820427,801776,780676,762230,743983,723945,699957,673179,649904,630063,608676,586607,562974],p25:[2000000,1945367,1929704,1918355,1911185,1904472,1901950,1899721,1896844,1892195,1893180,1888188,1887400,1887491,1889928,1891663,1888473,1886449,1893328,1888256,1887955,1892058,1893446,1892615,1888491,1888358,1886809,1891863,1898963,1895112,1896483,1898450,1895804,1892468,1892862,1897041,1894649,1894944,1891732,1889049,1891144,1895244,1892056,1887885,1890082,1892448,1892671,1893477,1898479,1896879,1893139,1894547,1885589,1877288,1875809,1877880,1864530,1869511,1872785,1867721,1861187,1856299,1848832,1839411,1843612,1844933,1850328,1841660,1836718,1832820,1832734,1833599,1828466,1817531,1808530,1808718,1792383,1791244,1791023,1782528,1774531],p50:[2000000,2011698,2022361,2027621,2038188,2050081,2062777,2072604,2085955,2098759,2109601,2118078,2128058,2143013,2157606,2163993,2178976,2192699,2204583,2213850,2228264,2241839,2251538,2265309,2275810,2282486,2292341,2306057,2313663,2331003,2345267,2351461,2371273,2378338,2395068,2402001,2411077,2424628,2431097,2448514,2466389,2481874,2496405,2511138,2515464,2525903,2529705,2550883,2563338,2575560,2583449,2599783,2612783,2624990,2642430,2652963,2666453,2687295,2702189,2722845,2731103,2751176,2771411,2785509,2791831,2792349,2813267,2823107,2827191,2838527,2850162,2864758,2890695,2900600,2914580,2917864,2924012,2934629,2955515,2967480,2993498],p75:[2000000,2078579,2115524,2150253,2179904,2208900,2235777,2267257,2293051,2316798,2348675,2375855,2401960,2424738,2448929,2480206,2507340,2530310,2556398,2584448,2610863,2640759,2662323,2690499,2718390,2748226,2771690,2799096,2827043,2866131,2891642,2920600,2945469,2981208,3006739,3038307,3058202,3093592,3112793,3141599,3182488,3208264,3241248,3266955,3294898,3331138,3368084,3402400,3444892,3479138,3511719,3538244,3575573,3585091,3646596,3672124,3703906,3738085,3768455,3796222,3835225,3882051,3910842,3959868,4003685,4044847,4067772,4095458,4131377,4172251,4204552,4249970,4283465,4317188,4372783,4410209,4461448,4477685,4536747,4583407,4611829],p90:[2000000,2139129,2206946,2267026,2317324,2367535,2417267,2462394,2501269,2542834,2583010,2629957,2673619,2716271,2764126,2804020,2839633,2884569,2930461,2974636,3015268,3056134,3095299,3146879,3191926,3226676,3278815,3330784,3363641,3415770,3449178,3498522,3561935,3608900,3665711,3706543,3736610,3801275,3847738,3890041,3940307,3977172,4037175,4093322,4143478,4206493,4252817,4333118,4386568,4451262,4511650,4578922,4624439,4683873,4721322,4817980,4866241,4934636,4976973,5067355,5101331,5187299,5256075,5341559,5443692,5532151,5554402,5635124,5685528,5744950,5815447,5926162,5961510,6034857,6106563,6173415,6228954,6292805,6401628,6500851,6558610],p95:[2000000,2176323,2260412,2343574,2407599,2469364,2531462,2581151,2640867,2676518,2738820,2788114,2838564,2897426,2951927,3010444,3062104,3119619,3179637,3241624,3302419,3339723,3402077,3466966,3511414,3565798,3628891,3682011,3737976,3796364,3873845,3933667,3993322,4037499,4115335,4187858,4238790,4303451,4387598,4432551,4507389,4589311,4628673,4724209,4773684,4858742,4955409,5046288,5111294,5204056,5240002,5342294,5435226,5514906,5595649,5663911,5731762,5849655,5911047,5987865,6086810,6182241,6278362,6345511,6461838,6598604,6696259,6768243,6871533,6927840,7059954,7122849,7227763,7342783,7456554,7592189,7685990,7797706,7978507,8089440,8184305]},
    hist:[403,551,768,885,957,944,887,806,662,584,483,394,332,262,215,162,113,99,83,85,65,42,32,32,25],
    hist_edges:[0,456510,913021,1369531,1826041,2282551,2739062,3195572,3652082,4108593,4565103,5021613,5478124,5934634,6391144,6847654,7304165,7760675,8217185,8673696,9130206,9586716,10043227,10499737,10956247,11412757],
    mean:[2000000,2013125,2025554,2038133,2050644,2063953,2078174,2091709,2105271,2118558,2133888,2147627,2161687,2176457,2192773,2208726,2224648,2238987,2254872,2269285,2285607,2300554,2314891,2331894,2348641,2364359,2378381,2394483,2410387,2429393,2446215,2461919,2480583,2496966,2516483,2532470,2549269,2567484,2582380,2601264,2623271,2642027,2658428,2676612,2692368,2713175,2732322,2751929,2772927,2795494,2814141,2833134,2851705,2870888,2892849,2913631,2935086,2958322,2977624,3000753,3022394,3050250,3072861,3093657,3117116,3140475,3162758,3184366,3206186,3228226,3249988,3274152,3300015,3323201,3344516,3366078,3386046,3410847,3440279,3462499,3485356],
  },
  growth: {
    key:"growth", label:"Crecimiento", color:"#E65100", desc:"Orientado al crecimiento con significativa exposición a renta variable y capital privado.",
    weights:{equities:0.55,bonds:0.10,private_equity:0.20,infrastructure:0.10,cash:0.05},
    median:[2000000,2015721,2030659,2036755,2053214,2069964,2084837,2098703,2115746,2135748,2151079,2164015,2178807,2197211,2215845,2232993,2245892,2264304,2282787,2297826,2316475,2340763,2353390,2370682,2386020,2400949,2413466,2436820,2447900,2473231,2494418,2507453,2526016,2546926,2562735,2582941,2605745,2625747,2646234,2665918,2681985,2722411,2741914,2758215,2776561,2800400,2807216,2839087,2857317,2896754,2901109,2927808,2952304,2972722,3006088,3029991,3057196,3092234,3122080,3142148,3174427,3205715,3231089,3259450,3281412,3308399,3345569,3345530,3371825,3386603,3400511,3429252,3481682,3500784,3521408,3546426,3569491,3582899,3628164,3671493,3703378],
    final_median:3703378,var95:0.8419,cvar95:0.9633,mdd:0.414,sharpe:-0.157,p_goal:0.6648,p_ruin:0.018,vol:0.178,
    p5:[2000000,1838153,1780000,1735000,1695000,1660000,1630000,1602000,1576000,1552000,1530000,1509000,1490000,1472000,1455000,1439000,1424000,1409000,1395000,1382000,1369000,1357000,1345000,1334000,1323000,1312000,1301000,1291000,1281000,1271000,1261000,1252000,1243000,1234000,1225000,1216000,1207000,1199000,1191000,1183000,1175000,1167000,1160000,1153000,1146000,1139000,1132000,1125000,1118000,1112000,1106000,1100000,1094000,1088000,1082000,1076000,1070000,1065000,1060000,1055000,1050000,1045000,1040000,1035000,1030000,1025000,1020000,1015000,1010000,1005000,1000000,995000,990000,985000,980000,975000,970000,965000,960000,955000,950000],
    p95:[2000000,2200000,2350000,2490000,2620000,2750000,2880000,3010000,3140000,3260000,3380000,3500000,3620000,3740000,3860000,3980000,4100000,4220000,4340000,4460000,4580000,4700000,4820000,4940000,5060000,5180000,5300000,5420000,5540000,5660000,5780000,5900000,6020000,6140000,6260000,6380000,6500000,6620000,6740000,6860000,6980000,7100000,7220000,7340000,7460000,7580000,7700000,7820000,7940000,8060000,8180000,8300000,8420000,8540000,8660000,8780000,8900000,9020000,9140000,9260000,9380000,9500000,9620000,9740000,9860000,9980000,10100000,10220000,10340000,10460000,10580000,10700000,10820000,10940000,11060000,11180000,11300000,11420000,11540000,11660000,11780000],
  },
  aggressive: {
    key:"aggressive", label:"Agresivo", color:"#C62828", desc:"Máximo potencial de retorno. Concentrado en renta variable y capital privado.",
    weights:{equities:0.55,bonds:0.05,private_equity:0.25,infrastructure:0.10,cash:0.05},
    median:[2000000,2017600,2032635,2040053,2057876,2075341,2092080,2107232,2126712,2142805,2167095,2179052,2194537,2216462,2234966,2252555,2270899,2288989,2311066,2330710,2345287,2373352,2386531,2406560,2422925,2443414,2458785,2479492,2494418,2521534,2549122,2561090,2583657,2605769,2624953,2647400,2677566,2697701,2719926,2748681,2767088,2802458,2820781,2847197,2864179,2896206,2908021,2950693,2967771,3015734,3018546,3049429,3070747,3099402,3125982,3155023,3184921,3225302,3267759,3288205,3327034,3362574,3385966,3430529,3441961,3480955,3524140,3533800,3566262,3582587,3606671,3649342,3685984,3716104,3757082,3785492,3809248,3826344,3874136,3916259,3977788],
    final_median:3977788,var95:0.8776,cvar95:0.9765,mdd:0.4314,sharpe:-0.169,p_goal:0.6812,p_ruin:0.025,vol:0.193,
    p5:[2000000,1820000,1755000,1700000,1650000,1605000,1565000,1528000,1494000,1462000,1432000,1404000,1378000,1354000,1331000,1309000,1289000,1270000,1252000,1235000,1219000,1204000,1190000,1176000,1163000,1151000,1139000,1128000,1117000,1107000,1097000,1088000,1079000,1070000,1062000,1054000,1046000,1038000,1031000,1024000,1017000,1010000,1004000,998000,992000,986000,980000,975000,970000,965000,960000,955000,950000,945000,940000,936000,932000,928000,924000,920000,916000,912000,908000,904000,900000,896000,892000,888000,884000,880000,876000,872000,868000,864000,860000,856000,852000,848000,844000,840000],
    p95:[2000000,2230000,2400000,2560000,2710000,2860000,3010000,3160000,3310000,3450000,3590000,3730000,3870000,4010000,4150000,4290000,4430000,4570000,4710000,4850000,4990000,5130000,5270000,5410000,5550000,5690000,5830000,5970000,6110000,6250000,6390000,6530000,6670000,6810000,6950000,7090000,7230000,7370000,7510000,7650000,7790000,7930000,8070000,8210000,8350000,8490000,8630000,8770000,8910000,9050000,9190000,9330000,9470000,9610000,9750000,9890000,10030000,10170000,10310000,10450000,10590000,10730000,10870000,11010000,11150000,11290000,11430000,11570000,11710000,11850000,11990000,12130000,12270000,12410000,12550000,12690000,12830000,12970000,13110000,13250000,13390000],
  },
};

const TIME = Array.from({length:81}, (_,i) => +(i*0.25).toFixed(2));

const FRONTIER = [
  {ret:2.5,vol:0.5},{ret:2.84,vol:0.85},{ret:3.17,vol:1.45},{ret:3.5,vol:2.1},{ret:3.83,vol:2.77},
  {ret:4.16,vol:3.44},{ret:4.49,vol:4.11},{ret:4.82,vol:4.79},{ret:5.15,vol:5.47},{ret:5.48,vol:6.16},
  {ret:5.82,vol:6.86},{ret:6.15,vol:7.57},{ret:6.48,vol:8.31},{ret:6.81,vol:9.13},{ret:7.14,vol:10.05},
  {ret:7.47,vol:11.04},{ret:7.8,vol:12.09},{ret:8.13,vol:13.19},{ret:8.46,vol:14.43},
];

const ASSET_CLASSES = [
  {key:"equities",name:"Renta Variable Global",icon:"📈",ret:"8.0%",vol:"16.0%",desc:"Acciones de mercados desarrollados y emergentes. Principal motor de crecimiento a largo plazo.",details:"Incluye índices como MSCI World, S&P 500, MSCI EM. Históricamente ofrece la mayor rentabilidad real a largo plazo, con episodios de volatilidad significativa.",yield:"2.0%",liquidity:"Alta",horizon:"7+ años"},
  {key:"bonds",name:"Renta Fija Investment Grade",icon:"🏛️",ret:"3.5%",vol:"6.0%",desc:"Bonos soberanos y corporativos de alta calificación. Estabilizador del portfolio.",details:"Deuda soberana y corporativa con rating BBB o superior. Proporciona cupones regulares y actúa como contrapeso en correcciones de renta variable.",yield:"3.0%",liquidity:"Alta",horizon:"3+ años"},
  {key:"private_equity",name:"Capital Privado (Private Equity)",icon:"🏢",ret:"11.0%",vol:"22.0%",desc:"Participaciones en empresas no cotizadas. Prima de iliquidez significativa.",details:"Fondos de buyout, venture capital y growth equity. Acceso a compañías en fases de alto crecimiento no disponibles en mercados públicos. Compromiso de capital a largo plazo.",yield:"—",liquidity:"Muy Baja",horizon:"10+ años"},
  {key:"infrastructure",name:"Infraestructuras",icon:"⚡",ret:"7.0%",vol:"12.0%",desc:"Activos reales como energía, transporte y telecomunicaciones.",details:"Inversión en activos tangibles esenciales: autopistas, plantas de energía, redes de telecomunicaciones, aeropuertos. Flujos de caja estables vinculados a inflación.",yield:"4.0%",liquidity:"Baja",horizon:"7+ años"},
  {key:"cash",name:"Liquidez y Mercado Monetario",icon:"💶",ret:"2.5%",vol:"0.5%",desc:"Depósitos, letras del tesoro y fondos monetarios. Reserva de seguridad.",details:"Instrumentos de máxima seguridad y liquidez inmediata. Letras del Tesoro, depósitos a plazo y repos. Rentabilidad real cercana a cero pero sin riesgo de pérdida.",yield:"2.5%",liquidity:"Inmediata",horizon:"Cualquiera"},
];

const fmt = (v) => { if(v>=1e6) return `€${(v/1e6).toFixed(2)}M`; if(v>=1e3) return `€${(v/1e3).toFixed(0)}K`; return `€${Math.round(v)}`; };
const pct = (v) => `${(v*100).toFixed(1)}%`;

const C = {
  bg:"#FAFAF8",bgDark:"#F0EDE8",card:"#FFFFFF",border:"#E0DDD6",borderDark:"#C8C3B8",
  navy:"#1B2A4A",navyLight:"#2C4066",gold:"#8B7355",goldLight:"#A6956F",goldAccent:"#C5A55A",
  text:"#1B2A4A",textSec:"#5A6678",textMuted:"#8C95A4",
  green:"#2E7D32",greenBg:"#E8F5E9",red:"#C62828",redBg:"#FFEBEE",amber:"#E65100",amberBg:"#FFF3E0",blue:"#1565C0",blueBg:"#E3F2FD",
};

const today = new Date();
const dateStr = today.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});

export default function WealthLab() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({name:"",wealth:2000000,withdrawal:80000,contribution:0,goal:2500000,years:20,inflation:2.5,tolerance:"moderate"});
  const [selectedScenario, setSelectedScenario] = useState("moderate");
  const [showAssetDetail, setShowAssetDetail] = useState(null);
  const [reportTab, setReportTab] = useState(0);

  const sc = SCENARIOS[selectedScenario];
  const fanData = useMemo(() => {
    if(!sc.fan) return null;
    return TIME.map((t,i) => ({t,p5:sc.fan.p5[i],p25:sc.fan.p25[i],p50:sc.fan.p50[i],p75:sc.fan.p75[i],p90:sc.fan.p90[i],p95:sc.fan.p95[i],mean:sc.mean?.[i]}));
  }, [selectedScenario]);

  const scenarioCompare = useMemo(() =>
    TIME.map((t,i) => ({t,...Object.fromEntries(Object.entries(SCENARIOS).map(([k,s]) => [k,s.median[i]]))}))
  ,[]);

  const histData = useMemo(() => {
    if(!sc.hist) return [];
    return sc.hist.map((c,i) => ({bin:fmt(sc.hist_edges[i]),count:c,mid:(sc.hist_edges[i]+sc.hist_edges[i+1])/2}));
  },[selectedScenario]);

  const allocData = Object.entries(sc.weights).map(([k,v]) => {
    const a = ASSET_CLASSES.find(ac => ac.key===k);
    return {name:a?.name||k,value:+(v*100).toFixed(1),key:k};
  });
  const PIE_COLORS = ["#1565C0","#2E7D32","#7B1FA2","#E65100","#546E7A"];

  const Tip = ({active,payload,label,unit}) => {
    if(!active||!payload?.length) return null;
    return (<div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 12px",fontSize:11,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
      <div style={{color:C.textMuted,marginBottom:3,fontWeight:600}}>Año {typeof label==='number'?label.toFixed(1):label}</div>
      {payload.map((p,i) => (<div key={i} style={{color:p.color||C.text,marginBottom:1}}>{p.name}: {unit==="pct"?`${p.value}%`:fmt(p.value)}</div>))}
    </div>);
  };

  /* ════════════════════════════════════════════
     PANTALLA 0: BIENVENIDA
     ════════════════════════════════════════════ */
  if(step===0) return (
    <div style={{minHeight:"100vh",background:`linear-gradient(170deg, ${C.navy} 0%, #0D1B2E 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display','Georgia',serif",color:"#fff",padding:40,textAlign:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <div style={{width:60,height:2,background:C.goldAccent,marginBottom:32}}/>
      <div style={{fontSize:13,letterSpacing:"0.25em",textTransform:"uppercase",color:C.goldAccent,marginBottom:16,fontFamily:"'Source Sans 3',sans-serif",fontWeight:600}}>Plataforma de Simulación Patrimonial</div>
      <h1 style={{fontSize:52,fontWeight:700,letterSpacing:"-0.02em",marginBottom:8}}>WealthLab</h1>
      <div style={{width:40,height:1,background:"rgba(255,255,255,0.2)",margin:"16px auto"}}/>
      <p style={{fontSize:17,fontFamily:"'Source Sans 3',sans-serif",fontWeight:300,lineHeight:1.7,maxWidth:600,color:"rgba(255,255,255,0.75)",marginBottom:12}}>
        Motor avanzado de simulación Monte Carlo para la planificación patrimonial de clientes de banca privada.
      </p>
      <div style={{fontSize:13,fontFamily:"'Source Sans 3',sans-serif",color:"rgba(255,255,255,0.45)",marginBottom:48,lineHeight:1.8}}>
        Simulación de carteras multi-activo · Retornos correlacionados vía descomposición de Cholesky<br/>
        Análisis de riesgo integral · Optimización de carteras · Modelado de flujos del cliente
      </div>
      <button onClick={()=>setStep(1)} style={{background:"transparent",border:`1px solid ${C.goldAccent}`,color:C.goldAccent,padding:"14px 48px",fontSize:14,fontFamily:"'Source Sans 3',sans-serif",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",borderRadius:2,transition:"all 0.3s"}}
        onMouseEnter={e=>{e.target.style.background=C.goldAccent;e.target.style.color=C.navy}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color=C.goldAccent}}>
        Iniciar Simulación
      </button>
      <div style={{position:"absolute",bottom:24,fontSize:11,fontFamily:"'Source Sans 3',sans-serif",color:"rgba(255,255,255,0.3)",letterSpacing:"0.05em"}}>
        Diseñado por Pablo Cabaleiro · WealthLab v1.0
      </div>
    </div>
  );

  const SS = {fontFamily:"'Source Sans 3','Segoe UI',sans-serif"};
  const PF = {fontFamily:"'Playfair Display','Georgia',serif"};
  const MO = {fontFamily:"'JetBrains Mono',monospace"};

  const Header = () => (
    <div style={{background:C.navy,padding:"14px 36px",display:"flex",alignItems:"center",justifyContent:"space-between",...SS}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <div style={{...PF,fontSize:20,fontWeight:700,color:"#fff",letterSpacing:"-0.01em"}}>WealthLab</div>
        <div style={{width:1,height:20,background:"rgba(255,255,255,0.15)"}}/>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Simulación Patrimonial</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:16,fontSize:11,color:"rgba(255,255,255,0.5)"}}>
        {profile.name && <span style={{color:C.goldAccent}}>{profile.name}</span>}
        <span>{dateStr}</span>
        <span style={{fontSize:10,background:"rgba(197,165,90,0.15)",color:C.goldAccent,padding:"3px 10px",borderRadius:2,fontWeight:600}}>Diseñado por Pablo Cabaleiro</span>
      </div>
    </div>
  );

  const StepNav = ({current}) => (
    <div style={{background:C.bgDark,padding:"12px 36px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:0,...SS}}>
      {["1. Perfil del Cliente","2. Clases de Activo","3. Informe Financiero"].map((t,i) => (
        <button key={i} onClick={()=>setStep(i+1)} style={{background:"none",border:"none",padding:"8px 24px",fontSize:12,fontWeight:current===i+1?700:400,
          color:current===i+1?C.navy:C.textMuted,cursor:"pointer",borderBottom:current===i+1?`2px solid ${C.goldAccent}`:"2px solid transparent",letterSpacing:"0.03em"}}>{t}</button>
      ))}
    </div>
  );

  const Input = ({label,value,onChange,type="text",suffix,min,max,step:st}) => (
    <div style={{marginBottom:16}}>
      <label style={{fontSize:11,fontWeight:600,color:C.textSec,letterSpacing:"0.04em",display:"block",marginBottom:5,...SS}}>{label}</label>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <input type={type} value={value} onChange={onChange} min={min} max={max} step={st}
          style={{flex:1,padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:14,color:C.text,background:"#fff",outline:"none",...MO}} />
        {suffix && <span style={{fontSize:12,color:C.textMuted,...SS}}>{suffix}</span>}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     PANTALLA 1: PERFIL DEL CLIENTE
     ════════════════════════════════════════════ */
  if(step===1) return (
    <div style={{minHeight:"100vh",background:C.bg,...SS}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <Header/><StepNav current={1}/>
      <div style={{maxWidth:800,margin:"0 auto",padding:"40px 36px"}}>
        <div style={{marginBottom:32}}>
          <div style={{fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,fontWeight:600,marginBottom:8}}>Paso 1 de 3</div>
          <h2 style={{...PF,fontSize:28,fontWeight:600,color:C.navy,marginBottom:8}}>Perfil del Cliente</h2>
          <p style={{fontSize:14,color:C.textSec,lineHeight:1.6}}>Configure los parámetros financieros del cliente para personalizar la simulación Monte Carlo.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24,gridColumn:"span 2"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,letterSpacing:"0.04em",textTransform:"uppercase"}}>Datos Personales</div>
            <Input label="Nombre completo del cliente" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} />
          </div>

          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,letterSpacing:"0.04em",textTransform:"uppercase"}}>Patrimonio</div>
            <Input label="Patrimonio inicial (€)" type="number" value={profile.wealth} onChange={e=>setProfile({...profile,wealth:+e.target.value})} min={100000} step={100000} suffix="EUR" />
            <Input label="Objetivo patrimonial (€)" type="number" value={profile.goal} onChange={e=>setProfile({...profile,goal:+e.target.value})} min={0} step={100000} suffix="EUR" />
          </div>

          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,letterSpacing:"0.04em",textTransform:"uppercase"}}>Flujos de Caja</div>
            <Input label="Retirada anual (€)" type="number" value={profile.withdrawal} onChange={e=>setProfile({...profile,withdrawal:+e.target.value})} min={0} step={10000} suffix="EUR/año" />
            <Input label="Aportación anual (€)" type="number" value={profile.contribution} onChange={e=>setProfile({...profile,contribution:+e.target.value})} min={0} step={10000} suffix="EUR/año" />
          </div>

          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,letterSpacing:"0.04em",textTransform:"uppercase"}}>Horizonte</div>
            <Input label="Horizonte temporal (años)" type="number" value={profile.years} onChange={e=>setProfile({...profile,years:+e.target.value})} min={1} max={50} />
            <Input label="Inflación anual esperada (%)" type="number" value={profile.inflation} onChange={e=>setProfile({...profile,inflation:+e.target.value})} min={0} max={15} step={0.5} suffix="%" />
          </div>

          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,letterSpacing:"0.04em",textTransform:"uppercase"}}>Perfil de Riesgo</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {Object.entries(SCENARIOS).map(([k,s]) => (
                <button key={k} onClick={()=>{setProfile({...profile,tolerance:k});setSelectedScenario(k)}}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:6,cursor:"pointer",textAlign:"left",transition:"all 0.2s",
                    background:profile.tolerance===k?"#f5f3ee":"#fff",border:profile.tolerance===k?`2px solid ${C.goldAccent}`:`1px solid ${C.border}`}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <div><div style={{fontSize:13,fontWeight:700,color:C.navy}}>{s.label}</div><div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{s.desc}</div></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:32}}>
          <button onClick={()=>setStep(2)} style={{background:C.navy,color:"#fff",border:"none",padding:"12px 36px",borderRadius:4,fontSize:13,fontWeight:600,cursor:"pointer",letterSpacing:"0.06em"}}>
            Continuar a Clases de Activo →
          </button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     PANTALLA 2: CLASES DE ACTIVO
     ════════════════════════════════════════════ */
  if(step===2) return (
    <div style={{minHeight:"100vh",background:C.bg,...SS}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <Header/><StepNav current={2}/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"40px 36px"}}>
        <div style={{marginBottom:32}}>
          <div style={{fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,fontWeight:600,marginBottom:8}}>Paso 2 de 3</div>
          <h2 style={{...PF,fontSize:28,fontWeight:600,color:C.navy,marginBottom:8}}>Universo de Clases de Activo</h2>
          <p style={{fontSize:14,color:C.textSec,lineHeight:1.6}}>
            El motor de simulación modela 5 clases de activo con retornos correlacionados mediante descomposición de Cholesky de la matriz de covarianza.
            Seleccione un perfil predefinido o revise cada clase en detalle.
          </p>
        </div>

        {/* Asset class cards */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
          {ASSET_CLASSES.map((a,i) => {
            const w = sc.weights[a.key] || 0;
            const isOpen = showAssetDetail===a.key;
            return (
              <div key={a.key} style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",transition:"all 0.3s"}}>
                <div onClick={()=>setShowAssetDetail(isOpen?null:a.key)}
                  style={{padding:"16px 24px",display:"grid",gridTemplateColumns:"44px 1fr 100px 100px 100px 80px 32px",alignItems:"center",gap:12,cursor:"pointer"}}>
                  <div style={{fontSize:28}}>{a.icon}</div>
                  <div><div style={{fontSize:14,fontWeight:700,color:C.navy}}>{a.name}</div><div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{a.desc}</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.textMuted}}>Retorno</div><div style={{...MO,fontSize:14,fontWeight:700,color:C.green}}>{a.ret}</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.textMuted}}>Volatilidad</div><div style={{...MO,fontSize:14,fontWeight:700,color:C.amber}}>{a.vol}</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.textMuted}}>Asignación</div><div style={{...MO,fontSize:18,fontWeight:700,color:C.navy}}>{(w*100).toFixed(0)}%</div></div>
                  <div style={{height:6,borderRadius:3,background:C.bgDark,overflow:"hidden"}}><div style={{height:"100%",width:`${w*100}%`,background:PIE_COLORS[i],borderRadius:3,transition:"width 0.3s"}}/></div>
                  <div style={{fontSize:16,color:C.textMuted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▾</div>
                </div>
                {isOpen && (
                  <div style={{padding:"0 24px 20px 80px",borderTop:`1px solid ${C.border}`,paddingTop:16,animation:"fadeIn 0.3s"}}>
                    <p style={{fontSize:13,color:C.textSec,lineHeight:1.7,marginBottom:16}}>{a.details}</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16}}>
                      <div style={{background:C.bgDark,borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Rentabilidad Esperada</div><div style={{...MO,fontSize:16,fontWeight:700,color:C.green}}>{a.ret}</div></div>
                      <div style={{background:C.bgDark,borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Volatilidad Anualizada</div><div style={{...MO,fontSize:16,fontWeight:700,color:C.amber}}>{a.vol}</div></div>
                      <div style={{background:C.bgDark,borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Yield / Dividendo</div><div style={{...MO,fontSize:16,fontWeight:700}}>{a.yield}</div></div>
                      <div style={{background:C.bgDark,borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,color:C.textMuted,marginBottom:2}}>Liquidez</div><div style={{fontSize:14,fontWeight:700,color:C.navy}}>{a.liquidity}</div></div>
                    </div>
                    <div style={{marginTop:12,fontSize:11,color:C.textMuted}}>Horizonte mínimo recomendado: <strong style={{color:C.text}}>{a.horizon}</strong></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Allocation summary + selector */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:32}}>
          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,letterSpacing:"0.04em",textTransform:"uppercase"}}>Seleccionar Perfil de Inversión</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {Object.entries(SCENARIOS).map(([k,s]) => (
                <button key={k} onClick={()=>setSelectedScenario(k)}
                  style={{padding:"12px 14px",borderRadius:6,cursor:"pointer",textAlign:"left",transition:"all 0.2s",
                    background:selectedScenario===k?"#f5f3ee":"#fff",border:selectedScenario===k?`2px solid ${s.color}`:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/>
                    <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{s.label}</span>
                  </div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>Mediana: {fmt(s.final_median)}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <PieChart width={240} height={200}>
              <Pie data={allocData} cx={120} cy={100} innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">
                {allocData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>`${v}%`} contentStyle={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,fontSize:11}}/>
            </PieChart>
          </div>
        </div>

        {/* Correlation matrix */}
        <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24,marginBottom:32}}>
          <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:12,letterSpacing:"0.04em",textTransform:"uppercase"}}>Matriz de Correlación entre Activos</div>
          <p style={{fontSize:12,color:C.textMuted,marginBottom:16}}>
            Los retornos de cada activo están correlacionados mediante la descomposición de Cholesky (Σ = L·Lᵀ). La simulación genera normales independientes Z ~ N(0,I) y las transforma en ε = L·Z para obtener retornos correlacionados.
          </p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,...MO}}>
              <thead><tr><th style={{padding:8,textAlign:"left",borderBottom:`2px solid ${C.border}`,fontSize:10,...SS,color:C.textMuted}}></th>
                {["RV","RF","PE","Infra","Cash"].map(h => <th key={h} style={{padding:8,textAlign:"center",borderBottom:`2px solid ${C.border}`,fontSize:10,...SS,color:C.textMuted}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[["RV",1.00,-0.10,0.72,0.45,0.02],["RF",-0.10,1.00,-0.05,0.15,0.10],["PE",0.72,-0.05,1.00,0.35,0.00],["Infra",0.45,0.15,0.35,1.00,0.05],["Cash",0.02,0.10,0.00,0.05,1.00]].map((row,i) => (
                  <tr key={i}><td style={{padding:8,fontWeight:700,...SS,color:C.navy,borderBottom:`1px solid ${C.bgDark}`}}>{row[0]}</td>
                    {row.slice(1).map((v,j) => {
                      const abs = Math.abs(v);
                      const bg = v===1?"#E8EAF6":v>0.3?`rgba(21,101,192,${abs*0.2})`:v<-0.05?`rgba(198,40,40,${abs*0.3})`:"transparent";
                      return <td key={j} style={{padding:8,textAlign:"center",borderBottom:`1px solid ${C.bgDark}`,background:bg,color:v===1?C.navy:C.textSec}}>{v.toFixed(2)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
          <button onClick={()=>setStep(1)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textSec,padding:"12px 28px",borderRadius:4,fontSize:13,cursor:"pointer"}}>← Volver al Perfil</button>
          <button onClick={()=>setStep(3)} style={{background:C.navy,color:"#fff",border:"none",padding:"12px 36px",borderRadius:4,fontSize:13,fontWeight:600,cursor:"pointer",letterSpacing:"0.06em"}}>
            Generar Informe Financiero →
          </button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     PANTALLA 3: INFORME FINANCIERO
     ════════════════════════════════════════════ */
  const REPORT_TABS = ["Resumen Ejecutivo","Simulación Monte Carlo","Métricas de Riesgo","Comparativa","Frontera Eficiente"];

  return (
    <div style={{minHeight:"100vh",background:C.bg,...SS}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <Header/><StepNav current={3}/>

      {/* Report Header */}
      <div style={{background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"28px 36px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,fontWeight:600,marginBottom:6}}>Informe Confidencial · {dateStr}</div>
            <h1 style={{...PF,fontSize:30,fontWeight:700,color:C.navy,margin:0}}>Informe de Simulación Patrimonial</h1>
            <div style={{fontSize:13,color:C.textSec,marginTop:6}}>
              Preparado para <strong style={{color:C.navy}}>{profile.name || "Cliente"}</strong> · Perfil {sc.label} · Horizonte {profile.years} años
            </div>
          </div>
          <div style={{textAlign:"right",fontSize:11,color:C.textMuted}}>
            <div>10.000 simulaciones Monte Carlo</div>
            <div>GBM con correlación Cholesky</div>
            <div style={{marginTop:4,color:C.gold,fontWeight:600}}>Preparado por Pablo Cabaleiro</div>
          </div>
        </div>
      </div>

      {/* Report tabs */}
      <div style={{background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"0 36px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:0}}>
          {REPORT_TABS.map((t,i) => (
            <button key={i} onClick={()=>setReportTab(i)} style={{background:"none",border:"none",padding:"12px 20px",fontSize:11,fontWeight:reportTab===i?700:400,cursor:"pointer",
              color:reportTab===i?C.navy:C.textMuted,borderBottom:reportTab===i?`2px solid ${C.goldAccent}`:"2px solid transparent",letterSpacing:"0.03em"}}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 36px"}}>

        {/* ── TAB 0: RESUMEN EJECUTIVO ── */}
        {reportTab===0 && (<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16,marginBottom:24}}>
            {[
              {label:"Patrimonio Mediano a "+profile.years+"Y",value:fmt(sc.final_median),color:C.blue,bg:C.blueBg},
              {label:"Probabilidad de Objetivo",value:pct(sc.p_goal),color:sc.p_goal>=0.5?C.green:C.red,bg:sc.p_goal>=0.5?C.greenBg:C.redBg},
              {label:"Probabilidad de Ruina",value:pct(sc.p_ruin),color:sc.p_ruin<0.05?C.green:C.red,bg:sc.p_ruin<0.05?C.greenBg:C.redBg},
              {label:"Máximo Drawdown Medio",value:pct(sc.mdd),color:C.amber,bg:C.amberBg},
            ].map((m,i) => (
              <div key={i} style={{background:m.bg,borderRadius:8,padding:"18px 20px",border:`1px solid ${m.color}22`}}>
                <div style={{fontSize:10,fontWeight:600,color:C.textSec,letterSpacing:"0.05em",marginBottom:6}}>{m.label}</div>
                <div style={{...MO,fontSize:26,fontWeight:700,color:m.color}}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20,marginBottom:24}}>
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:4,letterSpacing:"0.04em",textTransform:"uppercase"}}>Opinión del Asesor</div>
              <div style={{width:30,height:2,background:C.goldAccent,marginBottom:16}}/>
              <p style={{fontSize:13,color:C.textSec,lineHeight:1.8}}>
                Basándonos en 10.000 simulaciones Monte Carlo con retornos correlacionados mediante descomposición de Cholesky, 
                el perfil <strong style={{color:C.navy}}>{sc.label}</strong> presenta una probabilidad del <strong style={{color:C.navy}}>{pct(sc.p_goal)}</strong> de
                alcanzar el objetivo patrimonial de <strong>{fmt(profile.goal)}</strong> en {profile.years} años.
              </p>
              <p style={{fontSize:13,color:C.textSec,lineHeight:1.8,marginTop:12}}>
                El patrimonio mediano proyectado es de <strong style={{color:C.navy}}>{fmt(sc.final_median)}</strong>, con un rango intercuartílico
                que refleja la dispersión natural de los mercados financieros. La simulación incorpora retiradas anuales de {fmt(profile.withdrawal)} ajustadas
                por inflación del {profile.inflation}%, modelando flujos reales del cliente.
              </p>
              <p style={{fontSize:13,color:C.textSec,lineHeight:1.8,marginTop:12}}>
                El Value at Risk al 95% sobre el horizonte completo es del {pct(sc.var95)}, y el Expected Shortfall (CVaR) del {pct(sc.cvar95)}.
                La probabilidad de ruina se sitúa en {pct(sc.p_ruin)}, dentro de parámetros aceptables para este perfil de riesgo.
              </p>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:12,textTransform:"uppercase"}}>Asignación de Activos</div>
                <PieChart width={220} height={150}><Pie data={allocData} cx={110} cy={75} innerRadius={35} outerRadius={65} paddingAngle={2} dataKey="value">{allocData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}</Pie></PieChart>
                {allocData.map((a,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",fontSize:11}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i]}}/><span style={{color:C.textSec}}>{a.name}</span></div>
                  <span style={{...MO,fontWeight:700,color:C.navy}}>{a.value}%</span>
                </div>))}
              </div>
              <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:12,textTransform:"uppercase"}}>Parámetros del Cliente</div>
                {[["Patrimonio Inicial",fmt(profile.wealth)],["Retirada Anual",fmt(profile.withdrawal)],["Objetivo",fmt(profile.goal)],["Horizonte",`${profile.years} años`],["Inflación",`${profile.inflation}%`]].map(([l,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:11,borderBottom:i<4?`1px solid ${C.bgDark}`:"none"}}>
                    <span style={{color:C.textMuted}}>{l}</span><span style={{...MO,fontWeight:600,color:C.navy}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Median paths chart */}
          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,textTransform:"uppercase"}}>Proyección de Trayectorias Medianas</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={scenarioCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.bgDark}/>
                <XAxis dataKey="t" tick={{fontSize:10,fill:C.textMuted}} label={{value:"Años",position:"bottom",offset:-5,fill:C.textMuted,fontSize:10}}/>
                <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={fmt}/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine y={profile.goal} stroke={C.gold} strokeDasharray="6 4" label={{value:`Objetivo: ${fmt(profile.goal)}`,fill:C.gold,fontSize:10}}/>
                <ReferenceLine y={profile.wealth} stroke={C.textMuted} strokeDasharray="3 3"/>
                {Object.entries(SCENARIOS).map(([k,s])=>(<Line key={k} type="monotone" dataKey={k} stroke={s.color} strokeWidth={selectedScenario===k?3:1.5} strokeOpacity={selectedScenario===k?1:0.4} dot={false} name={s.label}/>))}
                <Legend wrapperStyle={{fontSize:11}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>)}

        {/* ── TAB 1: SIMULACIÓN MONTE CARLO ── */}
        {reportTab===1 && fanData && (<div>
          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24,marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:4,textTransform:"uppercase"}}>Diagrama de Abanico — Percentiles de la Simulación</div>
            <div style={{width:30,height:2,background:C.goldAccent,marginBottom:12}}/>
            <p style={{fontSize:12,color:C.textSec,lineHeight:1.7,marginBottom:16}}>
              Las bandas sombreadas representan los percentiles 5 al 95 de 10.000 trayectorias simuladas. El abanico se ensancha con el tiempo reflejando la incertidumbre compuesta.
              Cada trayectoria evoluciona según Movimiento Browniano Geométrico: dS = μ·S·dt + σ·S·dW, con corrección de Itô para el drift logarítmico.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={fanData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.bgDark}/>
                <XAxis dataKey="t" tick={{fontSize:10,fill:C.textMuted}}/>
                <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={fmt}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="p95" fill="#C5CAE9" fillOpacity={0.3} stroke="none" name="P95"/>
                <Area type="monotone" dataKey="p90" fill="#9FA8DA" fillOpacity={0.3} stroke="none" name="P90"/>
                <Area type="monotone" dataKey="p75" fill="#7986CB" fillOpacity={0.3} stroke="none" name="P75"/>
                <Area type="monotone" dataKey="p50" fill="#5C6BC0" fillOpacity={0.3} stroke={C.blue} strokeWidth={2} name="Mediana"/>
                <Area type="monotone" dataKey="p25" fill={C.bg} fillOpacity={0.8} stroke="none" name="P25"/>
                <Area type="monotone" dataKey="p5" fill={C.bg} fillOpacity={0.9} stroke="none" name="P5"/>
                {fanData[0].mean!==undefined && <Line type="monotone" dataKey="mean" stroke={C.amber} strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Media"/>}
                <ReferenceLine y={profile.goal} stroke={C.gold} strokeDasharray="6 4"/>
                <Legend wrapperStyle={{fontSize:10}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {histData.length>0 && (
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:12,textTransform:"uppercase"}}>Distribución del Patrimonio Final</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={histData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.bgDark}/>
                  <XAxis dataKey="bin" tick={{fontSize:9,fill:C.textMuted}} interval={2} angle={-15} textAnchor="end"/>
                  <YAxis tick={{fontSize:10,fill:C.textMuted}}/>
                  <Tooltip contentStyle={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,fontSize:11}}/>
                  <Bar dataKey="count" name="Simulaciones" radius={[3,3,0,0]}>
                    {histData.map((d,i)=><Cell key={i} fill={d.mid<profile.wealth?C.red:d.mid<profile.goal?"#FFB74D":C.blue} fillOpacity={0.75}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:10,fontSize:10,color:C.textMuted}}>
                <span><span style={{display:"inline-block",width:10,height:10,background:C.red,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/> Por debajo del patrimonio inicial</span>
                <span><span style={{display:"inline-block",width:10,height:10,background:"#FFB74D",borderRadius:2,marginRight:4,verticalAlign:"middle"}}/> Entre inicial y objetivo</span>
                <span><span style={{display:"inline-block",width:10,height:10,background:C.blue,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/> Objetivo alcanzado</span>
              </div>
            </div>
          )}
        </div>)}

        {/* ── TAB 2: MÉTRICAS DE RIESGO ── */}
        {reportTab===2 && (<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,textTransform:"uppercase"}}>Riesgo de Cola</div>
              <div style={{width:24,height:2,background:C.red,marginBottom:16}}/>
              {[["VaR 95%",pct(sc.var95),"Pérdida máxima al 95% de confianza"],["CVaR 95%",pct(sc.cvar95),"Pérdida media en el peor 5%"]].map(([l,v,d],i)=>(
                <div key={i} style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
                  <div style={{...MO,fontSize:24,fontWeight:700,color:C.red}}>{v}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{d}</div>
                </div>
              ))}
              <div style={{background:C.bgDark,borderRadius:6,padding:12,fontSize:11,color:C.textSec,lineHeight:1.6,marginTop:8}}>
                <strong>VaR</strong>: P(pérdida {">"} VaR) = 5%. <strong>CVaR</strong>: E[pérdida | pérdida {">"} VaR]. 
                CVaR es una medida coherente (sub-aditiva) preferida por reguladores (Basilea III/IV).
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,textTransform:"uppercase"}}>Drawdown</div>
              <div style={{width:24,height:2,background:C.amber,marginBottom:16}}/>
              {[["MDD Medio",pct(sc.mdd),"Media de la MDD de cada trayectoria"],["Volatilidad",pct(sc.vol),"Volatilidad anualizada del portfolio"]].map(([l,v,d],i)=>(
                <div key={i} style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
                  <div style={{...MO,fontSize:24,fontWeight:700,color:C.amber}}>{v}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{d}</div>
                </div>
              ))}
              <div style={{background:C.bgDark,borderRadius:6,padding:12,fontSize:11,color:C.textSec,lineHeight:1.6,marginTop:8}}>
                <strong>Maximum Drawdown</strong>: La mayor caída pico-a-valle en cada trayectoria. Mide la peor experiencia 
                que el cliente viviría — crítico para la tolerancia conductual.
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,textTransform:"uppercase"}}>Probabilidades</div>
              <div style={{width:24,height:2,background:C.green,marginBottom:16}}/>
              {[["P(Objetivo ≥ "+fmt(profile.goal)+")",pct(sc.p_goal),sc.p_goal>=0.5?C.green:C.red],["P(Ruina)",pct(sc.p_ruin),sc.p_ruin<0.05?C.green:C.red]].map(([l,v,col],i)=>(
                <div key={i} style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
                  <div style={{...MO,fontSize:24,fontWeight:700,color:col}}>{v}</div>
                </div>
              ))}
              <div style={{background:C.bgDark,borderRadius:6,padding:12,fontSize:11,color:C.textSec,lineHeight:1.6,marginTop:8}}>
                <strong>P(Ruina)</strong>: Fracción de trayectorias que tocan cero en cualquier momento, no solo al final.
                <strong> P(Objetivo)</strong>: Fracción con V(T) ≥ objetivo.
              </div>
            </div>
          </div>

          {/* Percentile ladder */}
          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,textTransform:"uppercase"}}>Escalera de Percentiles — Patrimonio Terminal</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:20,padding:"16px 0",justifyContent:"center"}}>
              {[{l:"P5",v:sc.p5?.[80]||sc.final_median*0.19,c:C.red},{l:"P25",v:sc.median[80]*0.6,c:C.amber},{l:"Mediana",v:sc.final_median,c:C.blue},{l:"P75",v:sc.final_median*1.5,c:C.green},{l:"P95",v:sc.p95?.[80]||sc.final_median*2.5,c:"#7B1FA2"}].map((item,i)=>{
                const maxV = (sc.p95?.[80]||sc.final_median*2.5);
                const barH = Math.max(20,(item.v/maxV)*180);
                return (<div key={i} style={{textAlign:"center",flex:1}}>
                  <div style={{...MO,fontSize:13,fontWeight:700,color:item.c,marginBottom:6}}>{fmt(item.v)}</div>
                  <div style={{height:barH,background:`linear-gradient(180deg, ${item.c}, ${item.c}33)`,borderRadius:"6px 6px 0 0",margin:"0 auto",width:52}}/>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:6,fontWeight:600}}>{item.l}</div>
                </div>);
              })}
            </div>
          </div>
        </div>)}

        {/* ── TAB 3: COMPARATIVA ── */}
        {reportTab===3 && (<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
            {Object.entries(SCENARIOS).map(([k,s]) => (
              <div key={k} style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:20,borderLeft:`4px solid ${s.color}`,
                outline:selectedScenario===k?`2px solid ${s.color}`:"none"}}>
                <div style={{fontSize:14,fontWeight:700,color:s.color,marginBottom:14}}>{s.label}</div>
                {[["Patrimonio Mediano",fmt(s.final_median),C.navy],["P(Objetivo)",pct(s.p_goal),s.p_goal>=0.5?C.green:C.red],["VaR 95%",pct(s.var95),C.red],["MDD Media",pct(s.mdd),C.amber],["P(Ruina)",pct(s.p_ruin),s.p_ruin<0.05?C.green:C.red],["Volatilidad",pct(s.vol),C.textSec]].map(([l,v,col],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<5?`1px solid ${C.bgDark}`:"none"}}>
                    <span style={{fontSize:10,color:C.textMuted}}>{l}</span>
                    <span style={{...MO,fontSize:12,fontWeight:700,color:col}}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:16,textTransform:"uppercase"}}>Trayectorias Medianas Comparadas</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scenarioCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.bgDark}/>
                <XAxis dataKey="t" tick={{fontSize:10,fill:C.textMuted}}/>
                <YAxis tick={{fontSize:10,fill:C.textMuted}} tickFormatter={fmt}/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine y={profile.goal} stroke={C.gold} strokeDasharray="6 4" label={{value:"Objetivo",fill:C.gold,fontSize:10}}/>
                {Object.entries(SCENARIOS).map(([k,s])=>(<Line key={k} type="monotone" dataKey={k} stroke={s.color} strokeWidth={2.5} dot={false} name={s.label}/>))}
                <Legend wrapperStyle={{fontSize:11}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>)}

        {/* ── TAB 4: FRONTERA EFICIENTE ── */}
        {reportTab===4 && (<div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:24}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:4,textTransform:"uppercase"}}>Frontera Eficiente de Markowitz</div>
              <div style={{width:30,height:2,background:C.goldAccent,marginBottom:12}}/>
              <p style={{fontSize:12,color:C.textSec,lineHeight:1.7,marginBottom:16}}>
                La frontera eficiente traza las carteras óptimas de riesgo-retorno utilizando optimización media-varianza con retornos
                correlacionados vía Cholesky. La cartera tangente (máximo ratio de Sharpe) se destaca en verde.
              </p>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{left:10,right:20,top:10,bottom:30}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.bgDark}/>
                  <XAxis type="number" dataKey="vol" name="Volatilidad" unit="%" tick={{fontSize:10,fill:C.textMuted}} label={{value:"Volatilidad Anualizada (%)",position:"bottom",offset:10,fill:C.textMuted,fontSize:10}}/>
                  <YAxis type="number" dataKey="ret" name="Retorno" unit="%" tick={{fontSize:10,fill:C.textMuted}} label={{value:"Retorno Esperado (%)",angle:-90,position:"insideLeft",offset:-5,fill:C.textMuted,fontSize:10}}/>
                  <Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0]?.payload;return(<div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:10,fontSize:11}}><div>Retorno: {d.ret}%</div><div>Volatilidad: {d.vol}%</div>{d.sr&&<div>Sharpe: {d.sr.toFixed(3)}</div>}</div>);}}/>
                  <Scatter data={FRONTIER} fill={C.blue} fillOpacity={0.7} r={5} name="Frontera"/>
                  <Scatter data={[{vol:5.33,ret:5.09,sr:0.485}]} fill={C.green} r={11} name="Máx Sharpe"/>
                  <Scatter data={[{vol:0.5,ret:2.5}]} fill={C.amber} r={11} name="Mín Varianza"/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:12,textTransform:"uppercase"}}>Cartera Máximo Sharpe</div>
                <div style={{width:20,height:2,background:C.green,marginBottom:12}}/>
                {[["Retorno Esperado","5.09%",C.green],["Volatilidad","5.33%",C.navy],["Ratio de Sharpe","0.485",C.blue]].map(([l,v,c],i)=>(
                  <div key={i} style={{marginBottom:10}}><div style={{fontSize:10,color:C.textMuted}}>{l}</div><div style={{...MO,fontSize:18,fontWeight:700,color:c}}>{v}</div></div>
                ))}
                <div style={{borderTop:`1px solid ${C.bgDark}`,paddingTop:12,marginTop:8}}>
                  {[["Renta Variable","4.6%"],["Renta Fija","28.6%"],["Capital Privado","13.5%"],["Infraestructuras","20.0%"],["Liquidez","33.3%"]].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}>
                      <span style={{color:C.textSec}}>{l}</span><span style={{...MO,fontWeight:600,color:C.navy}}>{v}</span></div>
                  ))}
                </div>
              </div>
              <div style={{background:"#fff",borderRadius:8,border:`1px solid ${C.border}`,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:12,textTransform:"uppercase"}}>Cartera Mínima Varianza</div>
                <div style={{width:20,height:2,background:C.amber,marginBottom:12}}/>
                {[["Retorno Esperado","2.50%",C.amber],["Volatilidad","0.50%",C.navy]].map(([l,v,c],i)=>(
                  <div key={i} style={{marginBottom:10}}><div style={{fontSize:10,color:C.textMuted}}>{l}</div><div style={{...MO,fontSize:18,fontWeight:700,color:c}}>{v}</div></div>
                ))}
                <div style={{borderTop:`1px solid ${C.bgDark}`,paddingTop:12,marginTop:8,fontSize:11,color:C.textSec}}>
                  Compuesta prácticamente al 100% por liquidez y mercado monetario. Minimiza la volatilidad a costa de un retorno real cercano a cero.
                </div>
              </div>
            </div>
          </div>
        </div>)}

        {/* Footer disclaimers */}
        <div style={{marginTop:40,borderTop:`1px solid ${C.border}`,paddingTop:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{fontSize:10,color:C.textMuted,lineHeight:1.7,maxWidth:"70%"}}>
              <strong style={{color:C.textSec}}>Aviso Legal:</strong> Este informe ha sido generado con fines de simulación y planificación patrimonial. 
              Los resultados se basan en modelos estocásticos (Movimiento Browniano Geométrico con correlación Cholesky) y no constituyen una garantía de rendimiento futuro. 
              Rentabilidades pasadas no garantizan rentabilidades futuras. El valor de las inversiones puede fluctuar y el inversor podría no recuperar el capital invertido.
              Consulte con su asesor financiero antes de tomar decisiones de inversión.
            </div>
            <div style={{textAlign:"right",fontSize:10,color:C.textMuted}}>
              <div style={{...PF,fontSize:14,color:C.navy,fontWeight:600,marginBottom:4}}>WealthLab v1.0</div>
              <div>Diseñado por <strong style={{color:C.gold}}>Pablo Cabaleiro</strong></div>
              <div style={{marginTop:4}}>Motor: NumPy · SciPy · FastAPI</div>
              <div>10.000 simulaciones · 5 clases de activo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
