import RottyMLogo from '@/components/RottyMLogo';

export default function OpsBrandMark({ size = 32 }: { size?: number }) {
  return <RottyMLogo variant="monogram" size={size} animated={true} />;
}
