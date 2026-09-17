// ---------------------------------------------------------------------------
// Full WC26 knockout bracket — R32 through Final.
// Reflects the REAL results. Each game carries team codes (h/a) plus `w`
// (winner) for every completed match. Spain won the Final 1–0 AET.
// ---------------------------------------------------------------------------

export const R32 = [
  { id:'r32-1',  seq:1,  h:'RSA', a:'CAN', w:'CAN', d:'Sun Jun 28', ds:'Sunday, June 28',    t:'3:00',  z:'PM ET', v:'SoFi Stadium',              c:'Inglewood, CA'       },
  { id:'r32-2',  seq:2,  h:'BRA', a:'JPN', w:'BRA', d:'Mon Jun 29', ds:'Monday, June 29',    t:'1:00',  z:'PM ET', v:'NRG Stadium',               c:'Houston, TX'         },
  { id:'r32-3',  seq:3,  h:'GER', a:'PAR', w:'PAR', pen:true, d:'Mon Jun 29', ds:'Monday, June 29',    t:'4:30',  z:'PM ET', v:'Gillette Stadium',           c:'Foxborough, MA'      },
  { id:'r32-4',  seq:4,  h:'NED', a:'MAR', w:'MAR', pen:true, d:'Mon Jun 29', ds:'Monday, June 29',    t:'9:00',  z:'PM ET', v:'Estadio BBVA',               c:'Monterrey'           },
  { id:'r32-5',  seq:5,  h:'CIV', a:'NOR', w:'NOR', d:'Tue Jun 30', ds:'Tuesday, June 30',   t:'1:00',  z:'PM ET', v:'AT&T Stadium',               c:'Arlington, TX'       },
  { id:'r32-6',  seq:6,  h:'FRA', a:'SWE', w:'FRA', d:'Tue Jun 30', ds:'Tuesday, June 30',   t:'5:00',  z:'PM ET', v:'MetLife Stadium',            c:'East Rutherford, NJ' },
  { id:'r32-7',  seq:7,  h:'MEX', a:'ECU', w:'MEX', d:'Tue Jun 30', ds:'Tuesday, June 30',   t:'9:00',  z:'PM ET', v:'Estadio Banorte',            c:'Mexico City'         },
  { id:'r32-8',  seq:8,  h:'ENG', a:'COD', w:'ENG', d:'Wed Jul 1',  ds:'Wednesday, July 1',  t:'12:00', z:'PM ET', v:'Mercedes-Benz Stadium',      c:'Atlanta, GA'         },
  { id:'r32-9',  seq:9,  h:'BEL', a:'SEN', w:'BEL', d:'Wed Jul 1',  ds:'Wednesday, July 1',  t:'4:00',  z:'PM ET', v:'Lumen Field',                c:'Seattle, WA'         },
  { id:'r32-10', seq:10, h:'USA', a:'BIH', w:'USA', d:'Wed Jul 1',  ds:'Wednesday, July 1',  t:'8:00',  z:'PM ET', v:"Levi's Stadium",             c:'Santa Clara, CA'     },
  { id:'r32-11', seq:11, h:'ESP', a:'AUT', w:'ESP', d:'Thu Jul 2',  ds:'Thursday, July 2',   t:'3:00',  z:'PM ET', v:'SoFi Stadium',               c:'Inglewood, CA'       },
  { id:'r32-12', seq:12, h:'POR', a:'CRO', w:'POR', d:'Thu Jul 2',  ds:'Thursday, July 2',   t:'7:00',  z:'PM ET', v:'BMO Field',                  c:'Toronto'             },
  { id:'r32-13', seq:13, h:'SUI', a:'ALG', w:'SUI', d:'Thu Jul 2',  ds:'Thursday, July 2',   t:'11:00', z:'PM ET', v:'BC Place',                   c:'Vancouver'           },
  { id:'r32-14', seq:14, h:'AUS', a:'EGY', w:'EGY', pen:true, d:'Fri Jul 3',  ds:'Friday, July 3',     t:'2:00',  z:'PM ET', v:'AT&T Stadium',               c:'Arlington, TX'       },
  { id:'r32-15', seq:15, h:'ARG', a:'CPV', w:'ARG', d:'Fri Jul 3',  ds:'Friday, July 3',     t:'6:00',  z:'PM ET', v:'Hard Rock Stadium',          c:'Miami Gardens, FL'   },
  { id:'r32-16', seq:16, h:'COL', a:'GHA', w:'COL', d:'Fri Jul 3',  ds:'Friday, July 3',     t:'9:30',  z:'PM ET', v:'Arrowhead Stadium',          c:'Kansas City, MO'     },
];

// R16 — explicit matchups + winners (results in). srcH/srcA kept for the
// connector geometry in the bracket view.
export const R16 = [
  { id:'r16-1', srcH:'r32-1',  srcA:'r32-4',  h:'CAN', a:'MAR', w:'MAR', pen:true, d:'Sat Jul 4', ds:'Saturday, July 4',  t:'1:00',  z:'PM ET', v:'NRG Stadium',               c:'Houston, TX'         },
  { id:'r16-2', srcH:'r32-6',  srcA:'r32-3',  h:'FRA', a:'PAR', w:'FRA', d:'Sat Jul 4', ds:'Saturday, July 4',  t:'5:00',  z:'PM ET', v:'MetLife Stadium',            c:'East Rutherford, NJ' },
  { id:'r16-3', srcH:'r32-11', srcA:'r32-12', h:'ESP', a:'POR', w:'ESP', d:'Mon Jul 6', ds:'Monday, July 6',    t:'3:00',  z:'PM ET', v:'AT&T Stadium',               c:'Arlington, TX'       },
  { id:'r16-4', srcH:'r32-9',  srcA:'r32-10', h:'BEL', a:'USA', w:'BEL', d:'Mon Jul 6', ds:'Monday, July 6',    t:'8:00',  z:'PM ET', v:'Lumen Field',                c:'Seattle, WA'         },
  { id:'r16-5', srcH:'r32-2',  srcA:'r32-5',  h:'BRA', a:'NOR', w:'NOR', d:'Sun Jul 5', ds:'Sunday, July 5',    t:'4:00',  z:'PM ET', v:'Lincoln Financial Field',    c:'Philadelphia, PA'    },
  { id:'r16-6', srcH:'r32-7',  srcA:'r32-8',  h:'MEX', a:'ENG', w:'ENG', d:'Sun Jul 5', ds:'Sunday, July 5',    t:'8:00',  z:'PM ET', v:'Estadio Banorte',            c:'Mexico City'         },
  { id:'r16-7', srcH:'r32-15', srcA:'r32-14', h:'ARG', a:'EGY', w:'ARG', d:'Tue Jul 7', ds:'Tuesday, July 7',   t:'4:00',  z:'PM ET', v:'BC Place',                   c:'Vancouver'           },
  { id:'r16-8', srcH:'r32-13', srcA:'r32-16', h:'SUI', a:'COL', w:'SUI', pen:true, d:'Tue Jul 7', ds:'Tuesday, July 7',   t:'12:00', z:'PM ET', v:'Mercedes-Benz Stadium',      c:'Atlanta, GA'         },
];

// QF — explicit matchups + winners (results in).
export const QF = [
  { id:'qf-1', srcH:'r16-1', srcA:'r16-2', h:'FRA', a:'MAR', w:'FRA', d:'Thu Jul 9',  ds:'Thursday, July 9',    t:'4:00',  z:'PM ET', v:'Gillette Stadium',           c:'Foxborough, MA'      },
  { id:'qf-2', srcH:'r16-3', srcA:'r16-4', h:'ESP', a:'BEL', w:'ESP', d:'Fri Jul 10', ds:'Friday, July 10',     t:'3:00',  z:'PM ET', v:'SoFi Stadium',               c:'Inglewood, CA'       },
  { id:'qf-3', srcH:'r16-5', srcA:'r16-6', h:'NOR', a:'ENG', w:'ENG', d:'Sat Jul 11', ds:'Saturday, July 11',   t:'5:00',  z:'PM ET', v:'Hard Rock Stadium',          c:'Miami Gardens, FL'   },
  { id:'qf-4', srcH:'r16-7', srcA:'r16-8', h:'ARG', a:'SUI', w:'ARG', d:'Sat Jul 11', ds:'Saturday, July 11',   t:'9:00',  z:'PM ET', v:'Arrowhead Stadium',          c:'Kansas City, MO'     },
];

// SF — results in. Spain and Argentina reach the Final.
export const SF = [
  { id:'sf-1', srcH:'qf-1', srcA:'qf-2', h:'FRA', a:'ESP', w:'ESP', d:'Tue Jul 14', ds:'Tuesday, July 14',   t:'3:00', z:'PM ET', v:'AT&T Stadium',          c:'Arlington, TX'       },
  { id:'sf-2', srcH:'qf-3', srcA:'qf-4', h:'ENG', a:'ARG', w:'ARG', d:'Wed Jul 15', ds:'Wednesday, July 15', t:'3:00', z:'PM ET', v:'Mercedes-Benz Stadium', c:'Atlanta, GA'         },
];

export const THIRD_PLACE = [
  { id:'tp',    srcH:'sf-1',  srcA:'sf-2',  loser:true, d:'Sat Jul 18', ds:'Saturday, July 18', t:'5:00', z:'PM ET', v:'Hard Rock Stadium', c:'Miami Gardens, FL' },
];

// FINAL — Spain beat Argentina 1–0 AET. World Cup complete.
export const FINAL = [
  { id:'final', srcH:'sf-1', srcA:'sf-2', h:'ESP', a:'ARG', w:'ESP', d:'Sun Jul 19', ds:'Sunday, July 19', t:'3:00', z:'PM ET', v:'MetLife Stadium', c:'East Rutherford, NJ' },
];

// Ordered bracket layout — top-to-bottom positions for each round.
// Top half feeds SF-1 (France / Spain), bottom half feeds SF-2 (England / Argentina).
// R32 ids are ordered so each pair lines up with the R16 slot its winners fill.
export const BRACKET_ORDER = {
  // r16-1 CAN/MAR ← r32-1,r32-4 · r16-2 FRA/PAR ← r32-6,r32-3
  // r16-3 ESP/POR ← r32-11,r32-12 · r16-4 BEL/USA ← r32-9,r32-10
  topHalf:   ['r32-1','r32-4','r32-6','r32-3','r32-11','r32-12','r32-9','r32-10'],
  // r16-5 BRA/NOR ← r32-2,r32-5 · r16-6 MEX/ENG ← r32-7,r32-8
  // r16-7 ARG/EGY ← r32-15,r32-14 · r16-8 SUI/COL ← r32-13,r32-16
  bottomHalf:['r32-2','r32-5','r32-7','r32-8','r32-15','r32-14','r32-13','r32-16'],
  topR16:    ['r16-1','r16-2','r16-3','r16-4'],
  bottomR16: ['r16-5','r16-6','r16-7','r16-8'],
  topQF:     ['qf-1','qf-2'],
  bottomQF:  ['qf-3','qf-4'],
};
