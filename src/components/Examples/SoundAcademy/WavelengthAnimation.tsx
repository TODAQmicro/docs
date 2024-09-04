import Wave from 'react-wavify'

export type Props = {
  count: number;
  colors: Array<string>;
};

export default function WavelengthAnimation(props: Props) {
  return (
    <Wave
      fill="#000"
      paused={false}
      style={{ display: 'flex' }}
      options={{
        height: 50,
        amplitude: 20,
        speed: 0.25,
        points: 3
      }} />
  );
}
