import { ScrollView } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants';

export const COLOR_DEPOSIT = Colors.primary;
export const COLOR_LOAN    = '#F5A623';
export const COLOR_RATIO   = Colors.growth;

const CW = 300, CH = 150, PL = 36, PB = 24, PR = 8, PT = 8;
const PW = CW - PL - PR;
const PH = CH - PB - PT;

const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}k`     : String(n);

type Props = {
  labels:   string[];
  deposits: number[];
  loans:    number[];
  ratio:    number[];
};

export function ComboChart({ labels, deposits, loans, ratio }: Props) {
  const n      = labels.length;
  const maxVal = Math.max(...deposits, ...loans, 1);
  const maxR   = Math.max(...ratio, 1);
  const step   = PW / n;

  const yVal = (v: number) => PT + PH - (v / maxVal) * PH;
  const yRat = (v: number) => PT + PH - (v / maxR)   * PH;

  const gridLines = [0.25, 0.5, 0.75, 1];

  const linePath = ratio.map((r, i) => {
    const x = PL + i * step + step / 2;
    const y = yRat(r);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={CW} height={CH}>
        {gridLines.map((f) => {
          const y = yVal(maxVal * f);
          return (
            <G key={f}>
              <Line x1={PL} y1={y} x2={CW - PR} y2={y} stroke={Colors.coolGray} strokeWidth={1} />
              <SvgText x={PL - 4} y={y + 3} fontSize={8} fill={Colors.steelGray} textAnchor="end">
                {fmtK(Math.round(maxVal * f))}
              </SvgText>
            </G>
          );
        })}
        <Line x1={PL} y1={PT + PH} x2={CW - PR} y2={PT + PH} stroke={Colors.coolGray} strokeWidth={1} />

        {labels.map((lbl, i) => {
          const x     = PL + i * step;
          const bw    = step * 0.32;
          const gap   = step * 0.06;
          const baseY = PT + PH;
          const dH    = (deposits[i] / maxVal) * PH;
          const lH    = (loans[i]    / maxVal) * PH;
          return (
            <G key={i}>
              <Rect x={x + gap}            y={baseY - dH} width={bw} height={dH} fill={COLOR_DEPOSIT} rx={2} opacity={0.85} />
              <Rect x={x + gap + bw + gap} y={baseY - lH} width={bw} height={lH} fill={COLOR_LOAN}    rx={2} opacity={0.85} />
              <SvgText x={x + step / 2} y={CH - 6} fontSize={8} fill={Colors.steelGray} textAnchor="middle">{lbl}</SvgText>
            </G>
          );
        })}

        {ratio.some(r => r > 0) && (
          <>
            <Path d={linePath} stroke={COLOR_RATIO} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {ratio.map((r, i) => (
              <Circle key={i} cx={PL + i * step + step / 2} cy={yRat(r)} r={3} fill={COLOR_RATIO} />
            ))}
          </>
        )}
      </Svg>
    </ScrollView>
  );
}
