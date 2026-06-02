/**
 * 81수리(數理) 길흉 — 수리성명학에서 각 격(오격)의 획수를 1~81 수리에 대응시켜
 * 길흉을 봅니다. 송대 채구봉(蔡九峰) 81수원도 → 熊崎式으로 정착.
 *
 * ## 81 초과 처리
 *   획수가 81을 넘으면 (n−1) % 80 + 1 로 1~81에 환원합니다(82→2, 161→1).
 *
 * ⚠️ **경계 수의 길흉은 학파/출처마다 갈립니다**(특히 26·38·40·48·51·55·71 등).
 *   이 표를 **단일 진실원천(SSOT)** 으로 고정하고, 다른 표와 다를 수 있음을 명시합니다.
 *   근거: sajuabc·finename·영남일보 81수리 해설 교차정리(general-purpose 리서치).
 *   값 변경 시 반드시 출처 대조 후 골든과 함께 갱신할 것.
 */

/** 수리 길흉 분류. */
export type NumerologyFortune = "길" | "흉" | "반길반흉";

export interface NumerologyMeaning {
  /** 길흉 분류. */
  fortune: NumerologyFortune;
  /** 격(格) 이름(통칭). */
  name: string;
}

/** 1~81 수리표(SSOT). 인덱스 = 수리(1-based). */
const TABLE: Readonly<Record<number, NumerologyMeaning>> = {
  1: { fortune: "길", name: "두령격(頭領格)" },
  2: { fortune: "흉", name: "분리격(分離格)" },
  3: { fortune: "길", name: "명예격(名譽格)" },
  4: { fortune: "흉", name: "사멸격(死滅格)" },
  5: { fortune: "길", name: "정성격(定成格)" },
  6: { fortune: "길", name: "계승격(繼承格)" },
  7: { fortune: "길", name: "강건격(剛健格)" },
  8: { fortune: "길", name: "개물격(開物格)" },
  9: { fortune: "흉", name: "궁박격(窮迫格)" },
  10: { fortune: "흉", name: "공허격(空虛格)" },
  11: { fortune: "길", name: "신성격(新成格)" },
  12: { fortune: "흉", name: "박약격(薄弱格)" },
  13: { fortune: "길", name: "지달격(智達格)" },
  14: { fortune: "흉", name: "이산격(離散格)" },
  15: { fortune: "길", name: "통솔격(統率格)" },
  16: { fortune: "길", name: "덕망격(德望格)" },
  17: { fortune: "길", name: "용진격(勇進格)" },
  18: { fortune: "길", name: "발전격(發展格)" },
  19: { fortune: "흉", name: "고난격(苦難格)" },
  20: { fortune: "흉", name: "허망격(虛妄格)" },
  21: { fortune: "길", name: "자립격(自立格)" },
  22: { fortune: "흉", name: "중절격(中折格)" },
  23: { fortune: "길", name: "혁신격(革新格)" },
  24: { fortune: "길", name: "축재격(蓄財格)" },
  25: { fortune: "길", name: "안전격(安全格)" },
  26: { fortune: "반길반흉", name: "변괴격(變怪格)" },
  27: { fortune: "흉", name: "중단격(中斷格)" },
  28: { fortune: "흉", name: "풍파격(風波格)" },
  29: { fortune: "길", name: "성공격(成功格)" },
  30: { fortune: "반길반흉", name: "춘몽격(春夢格)" },
  31: { fortune: "길", name: "흥성격(興盛格)" },
  32: { fortune: "길", name: "순풍격(順風格)" },
  33: { fortune: "길", name: "등룡격(登龍格)" },
  34: { fortune: "흉", name: "파멸격(破滅格)" },
  35: { fortune: "길", name: "태평격(太平格)" },
  36: { fortune: "흉", name: "의협격(義俠格)" },
  37: { fortune: "길", name: "인덕격(仁德格)" },
  38: { fortune: "반길반흉", name: "문예격(文藝格)" },
  39: { fortune: "길", name: "장성격(將星格)" },
  40: { fortune: "반길반흉", name: "변화격(變化格)" },
  41: { fortune: "길", name: "대공격(大功格)" },
  42: { fortune: "흉", name: "고행격(苦行格)" },
  43: { fortune: "흉", name: "성쇠격(盛衰格)" },
  44: { fortune: "흉", name: "마장격(魔障格)" },
  45: { fortune: "길", name: "대각격(大覺格)" },
  46: { fortune: "흉", name: "미운격(未運格)" },
  47: { fortune: "길", name: "출세격(出世格)" },
  48: { fortune: "길", name: "유덕격(有德格)" },
  49: { fortune: "흉", name: "변전격(變轉格)" },
  50: { fortune: "흉", name: "소실격(消失格)" },
  51: { fortune: "반길반흉", name: "성쇠격(盛衰格)" },
  52: { fortune: "길", name: "약진격(躍進格)" },
  53: { fortune: "흉", name: "내허격(內虛格)" },
  54: { fortune: "흉", name: "절망격(絶望格)" },
  55: { fortune: "반길반흉", name: "불안격(不安格)" },
  56: { fortune: "흉", name: "한탄격(恨歎格)" },
  57: { fortune: "길", name: "봉시격(逢時格)" },
  58: { fortune: "반길반흉", name: "후복격(後福格)" },
  59: { fortune: "흉", name: "실망격(失望格)" },
  60: { fortune: "흉", name: "암흑격(暗黑格)" },
  61: { fortune: "길", name: "번영격(繁榮格)" },
  62: { fortune: "흉", name: "고독격(孤獨格)" },
  63: { fortune: "길", name: "발전격(發展格)" },
  64: { fortune: "흉", name: "봉상격(逢霜格)" },
  65: { fortune: "길", name: "완미격(完美格)" },
  66: { fortune: "흉", name: "쇠망격(衰亡格)" },
  67: { fortune: "길", name: "천복격(天福格)" },
  68: { fortune: "길", name: "흥가격(興家格)" },
  69: { fortune: "흉", name: "궁박격(窮迫格)" },
  70: { fortune: "흉", name: "멸망격(滅亡格)" },
  71: { fortune: "반길반흉", name: "만달격(晩達格)" },
  72: { fortune: "흉", name: "후곤격(後困格)" },
  73: { fortune: "길", name: "평복격(平福格)" },
  74: { fortune: "흉", name: "우매격(愚昧格)" },
  75: { fortune: "반길반흉", name: "적시격(適時格)" },
  76: { fortune: "흉", name: "이산격(離散格)" },
  77: { fortune: "반길반흉", name: "전후격(前後格)" },
  78: { fortune: "반길반흉", name: "무력격(無力格)" },
  79: { fortune: "흉", name: "궁극격(窮極格)" },
  80: { fortune: "흉", name: "은둔격(隱遁格)" },
  81: { fortune: "길", name: "환원격(還元格)" },
};

/** 획수를 1~81 수리로 환원합니다(81 초과 시 (n−1)%80+1). */
export function normalizeNumerology(strokes: number): number {
  if (strokes <= 0) throw new Error(`수리는 양수여야 합니다: ${strokes}`);
  return strokes <= 81 ? strokes : ((strokes - 1) % 80) + 1;
}

/** 획수(격)에 대응하는 81수리 길흉을 반환합니다. */
export function numerologyOf(strokes: number): NumerologyMeaning {
  return TABLE[normalizeNumerology(strokes)];
}
